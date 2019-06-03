import EventDispatcher from '../core/EventDispatcher';
import HdrLoader from '../loaders/HdrLoader';
import ImageLoader from '../loaders/ImageLoader';
import { isPowerOf2, nearestPowerOf2 } from '../math/Utils';
import { createCanvas } from '../utils/Canvas';
import { warn } from '../utils/Console';
import * as GL from './GL';
import ImageData from './ImageData';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

interface Options {
  src?: number;
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
  resizeToPow2?: number;
}

export default class Texture extends EventDispatcher {
  public src: string;
  public magFilter: number;
  public minFilter: number;
  public wrapS: number;
  public wrapT: number;
  public resizeToPow2: boolean;
  public texture: WebGLTexture;
  public _isHdr: boolean;
  public image: HTMLImageElement | HTMLCanvasElement | ImageData;

  constructor(options: Options) {
    super();
    gl = GL.get();

    this.src = null;
    this.magFilter = gl.NEAREST;
    this.minFilter = gl.NEAREST;
    this.wrapS = gl.CLAMP_TO_EDGE;
    this.wrapT = gl.CLAMP_TO_EDGE;
    this.resizeToPow2 = false;

    Object.assign(this, options);

    const { canvas } = createCanvas(1, 1);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (this.src) {
      this._isHdr = this.src.split('.').pop() === 'hdr';
      this.load(this.src);
    }
  }

  public load(src: string) {
    if (this._isHdr) {
      HdrLoader(src)
        .then(this.onTextureLoaded)
        .catch(this.onTextureError);
    } else {
      ImageLoader(src)
        .then(this.onTextureLoaded)
        .catch(this.onTextureError);
    }
  }

  public onTextureLoaded = response => {
    this.image = response;
    this.update(this.image);
    this.emit('loaded');
  };

  public onTextureError = (error: string) => {
    warn(error);
    this.emit('error', error);
  };

  public updateImage(src: string) {
    this.src = src || this.src;
    this.load(this.src);
  }

  public update(image: HTMLCanvasElement | HTMLImageElement | ImageData) {
    gl = GL.get();

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (image instanceof ImageData && gl instanceof WebGL2RenderingContext) {
      this.image = image;
      // This is only for hdr data texture atm
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        image.width,
        image.height,
        0,
        gl.RGBA,
        gl.FLOAT,
        image.data
      );
    } else if (
      image instanceof HTMLCanvasElement ||
      image instanceof HTMLImageElement
    ) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public _resizeImage(image) {
    if (!this.resizeToPow2 || image instanceof ImageData) return this.image;

    // Return if the image size is already a power of 2
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      return image;
    }

    const size = nearestPowerOf2(Math.max(image.width, image.height));

    const { canvas, ctx } = createCanvas(size, size);
    ctx.drawImage(image, 0, 0, size, size);

    return canvas;
  }

  public dispose() {
    gl = GL.get();
    gl.deleteTexture(this.texture);
    this.texture = null;
  }
}
