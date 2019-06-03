import EventDispatcher from '../core/EventDispatcher';
import { createCanvas } from '../utils/Canvas';
import * as GL from './GL';

let gl;

interface VideoTextureOptions {
  src?: number;
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
  loop: boolean;
  autoplay: boolean;
}

export default class VideoTexture extends EventDispatcher {
  public src: string;
  public magFilter: number;
  public minFilter: number;
  public wrapS: number;
  public wrapT: number;
  public loop: boolean;
  public autoplay: boolean;
  public texture: WebGLTexture;
  public video: HTMLVideoElement;
  public _currentTime: number;

  constructor(options: VideoTextureOptions) {
    super();
    gl = GL.get();

    this.src = '';
    this.magFilter = gl.NEAREST;
    this.minFilter = gl.NEAREST;
    this.wrapS = gl.CLAMP_TO_EDGE;
    this.wrapT = gl.CLAMP_TO_EDGE;
    this.loop = false;
    this.autoplay = true;

    Object.assign(this, options);

    this.video = document.createElement('video');
    this.video.src = this.src;
    this.video.loop = this.loop;
    this.video.autoplay = this.autoplay;
    this.video.setAttribute('webkitplaysinline', 'webkitplaysinline');
    this.video.setAttribute('playsinline', 'playsinline');
    this.video.addEventListener('canplaythrough', this._onCanPlayThrough, true);
    this.video.addEventListener('ended', this._onEnded, true);
    this._currentTime = 0;

    const { canvas } = createCanvas(1, 1);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this.wrapT);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  public update() {
    gl = GL.get();

    if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
      if (this.video.currentTime !== this._currentTime) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          this.video
        );
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
      this._currentTime = this.video.currentTime;
    }
  }

  public _onCanPlayThrough = () => {
    this.emit('canplaythrough');
  };

  public _onEnded = () => {
    this.emit('ended');
  };
}
