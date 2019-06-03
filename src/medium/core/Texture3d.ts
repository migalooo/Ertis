import EventDispatcher from '../core/EventDispatcher';
import HdrLoader from '../loaders/HdrLoader';
import ImageLoader from '../loaders/ImageLoader';
import { warn } from '../utils/Console';
import * as GL from './GL';
import ImageData from './ImageData';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

interface Options {
  src: Uint8Array;
  size: number;
}

export default class Texture3d extends EventDispatcher {
  public src: Uint8Array;
  public size: number;
  public texture: WebGLTexture;

  constructor(options: Options) {
    super();
    gl = GL.get();

    if (!(gl instanceof WebGL2RenderingContext)) {
      return;
    }

    this.src = null;
    this.size = null;
    Object.assign(this, options);

    this.texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, this.texture);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, Math.log2(this.size));
    gl.texParameteri(
      gl.TEXTURE_3D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage3D(
      gl.TEXTURE_3D,
      0,
      gl.R8,
      this.size,
      this.size,
      this.size,
      0,
      gl.RED,
      gl.UNSIGNED_BYTE,
      this.src
    );
    gl.generateMipmap(gl.TEXTURE_3D);
  }

  public dispose() {
    gl = GL.get();
    if (!(gl instanceof WebGL2RenderingContext)) {
      return;
    }
    gl.deleteTexture(this.texture);
    this.texture = null;
  }
}
