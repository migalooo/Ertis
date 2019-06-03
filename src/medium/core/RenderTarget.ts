import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import * as GL from './GL';
import Scene from './Scene';
import * as UniformBuffers from './UniformBuffers';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

interface Options {
  width?: number;
  height?: number;
  ratio?: number;
  pixelRatio?: number;
}

interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ClearColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export default class RenderTarget {
  public width: number;
  public height: number;
  public ratio: number;
  public pixelRatio: number;
  public frameBuffer: WebGLFramebuffer;
  public renderBuffer: WebGLRenderbuffer;
  public texture: WebGLTexture;
  public viewport: Viewport;
  public autoClear: boolean;
  public clearColor: ClearColor;

  constructor(options: Options) {
    this.pixelRatio = options.pixelRatio || 1;
    this.width = options.width * this.pixelRatio;
    this.height = options.height * this.pixelRatio;
    this.ratio = this.width / this.height;
    this.viewport = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height
    };
    this.autoClear = true;
    this.clearColor = { r: 0, g: 0, b: 0, a: 1 };

    gl = GL.get();
    this.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.width,
      this.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    this.renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      this.width,
      this.height
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0
    );
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.renderBuffer
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  public setClearColor(r = 0, g = 0, b = 0, a = 1) {
    this.clearColor.r = r;
    this.clearColor.g = g;
    this.clearColor.b = b;
    this.clearColor.a = a;
  }

  public setSize(width: number, height: number) {
    const newWidth = width * this.pixelRatio;
    const newHeight = height * this.pixelRatio;

    if (newWidth !== this.width || newHeight !== this.height) {
      this.width = width * this.pixelRatio;
      this.height = height * this.pixelRatio;
      this.ratio = this.width / this.height;

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        this.width,
        this.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        this.width,
        this.height
      );
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);

      this.setViewport(0, 0, width, height);
    }
  }

  public setSissorTest(enable = false) {
    gl = GL.get();
    if (enable) {
      gl.enable(gl.SCISSOR_TEST);
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }
  }

  public setSissor(x: number, y: number, width: number, height: number) {
    gl = GL.get();
    gl.scissor(
      x * this.pixelRatio,
      y * this.pixelRatio,
      width * this.pixelRatio,
      height * this.pixelRatio
    );
  }

  public setViewport(x: number, y: number, width: number, height: number) {
    this.viewport.x = x * this.pixelRatio;
    this.viewport.y = y * this.pixelRatio;
    this.viewport.width = width * this.pixelRatio;
    this.viewport.height = height * this.pixelRatio;
  }

  public render(scene: Scene, camera: PerspectiveCamera | OrthographicCamera) {
    gl = GL.get();

    gl.viewport(
      this.viewport.x,
      this.viewport.y,
      this.viewport.width,
      this.viewport.height
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    if (this.autoClear) {
      gl.clearColor(
        this.clearColor.r,
        this.clearColor.g,
        this.clearColor.b,
        this.clearColor.a
      );
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // Update the scene
    scene.update();

    if (gl instanceof WebGL2RenderingContext) {
      // Update global uniform buffers
      UniformBuffers.updateProjectionView(gl, camera.projectionMatrix);
    }

    // Render the scene objects
    scene.objects.forEach(child => {
      if (child.isInstanced) {
        child.drawInstance(camera);
      } else {
        child.draw(camera);
      }
    });

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Reset
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}
