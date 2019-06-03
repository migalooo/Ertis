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
  src: string[];
  magFilter: number;
  minFilter: number;
  wrapS: number;
  wrapT: number;
  resizeToPow2: boolean;
}

export default class TextureCube extends EventDispatcher {
  public src: string[];
  public magFilter: number;
  public minFilter: number;
  public wrapS: number;
  public wrapT: number;
  public resizeToPow2: boolean;
  public texture: WebGLTexture;
  public _isHdr: boolean;
  public loaders: any[];
  public images: HTMLImageElement[];

  constructor(options: Options) {
    super();
    gl = GL.get();

    this.src = Array(6).fill('');
    this.magFilter = gl.LINEAR;
    this.minFilter = gl.LINEAR;
    this.wrapS = gl.CLAMP_TO_EDGE;
    this.wrapT = gl.CLAMP_TO_EDGE;
    this.resizeToPow2 = false;

    Object.assign(this, options);

    this.texture = gl.createTexture();
    this.images = [];
    this.loaders = [];

    const images = [];
    const { canvas } = createCanvas(1, 1);
    for (let i = 0; i < 6; i += 1) {
      images.push(canvas);
    }

    this.update(images);

    // Check media type
    this._isHdr = this.src[0].split('.').pop() === 'hdr';

    this.src.forEach((src, i) => {
      this.loaders[i] = this.load(this.src[i]);
    });

    Promise.all(this.loaders)
      .then(this.onTextureLoaded)
      .catch(this.onTextureError);
  }

  public load(src: string) {
    if (this._isHdr) {
      return HdrLoader(src);
    } else {
      return ImageLoader(src);
    }
  }

  public onTextureLoaded = response => {
    this.images = response;
    this.update(this.images);
    this.emit('loaded');
  };

  public onTextureError = (error: string) => {
    warn(error);
    this.emit('error', error);
  };

  public update(
    images: Array<HTMLCanvasElement | HTMLImageElement | ImageData>
  ) {
    gl = GL.get();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

    const targets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    for (let i = 0; i < 6; i += 1) {
      const image = this._isHdr ? images[i] : this._resizeImage(images[i]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if (image instanceof ImageData) {
        if (gl instanceof WebGL2RenderingContext) {
          gl.texImage2D(
            targets[i],
            0,
            gl.RGBA16F,
            image.width,
            image.height,
            0,
            gl.RGBA,
            gl.FLOAT,
            image.data
          );
        } else {
          // TODO
        }
      } else {
        gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
      gl.texParameteri(
        gl.TEXTURE_CUBE_MAP,
        gl.TEXTURE_MAG_FILTER,
        this.magFilter
      );
      gl.texParameteri(
        gl.TEXTURE_CUBE_MAP,
        gl.TEXTURE_MIN_FILTER,
        this.minFilter
      );
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, this.wrapS);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, this.wrapT);
    }
    // gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }

  public _resizeImage(image: HTMLCanvasElement | HTMLImageElement | ImageData) {
    if (!this.resizeToPow2 || image instanceof ImageData) return image;

    // Return if the image size is already a power of 2
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      return image;
    }

    const size = nearestPowerOf2(Math.max(image.width, image.height));

    const { canvas, ctx } = createCanvas(size, size);
    ctx.drawImage(image, 0, 0, size, size);

    return canvas;
  }
}
