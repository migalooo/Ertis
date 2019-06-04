import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthorgraphicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import Scene from '../core/Scene';
import { log, warn } from '../utils/Console';
import Detect from '../utils/Detect';
import * as Capabilities from './Capabilities';
import {
  RENDERER_DEFAULT_CONTEXT,
  RENDERER_DEFAULT_HEIGHT,
  RENDERER_DEFAULT_WIDTH,
  WEBGL2_CONTEXT,
  WEBGL_CONTEXT
} from './Constants';
import * as GL from './GL';
import * as UniformBuffers from './UniformBuffers';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

interface Options {
  width?: number;
  height?: number;
  ratio?: number;
  preserveDrawingBuffer?: boolean;
  pixelRatio?: number;
  prefferedContext?: string;
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

export default class Renderer {
  public width: number;
  public height: number;
  public ratio: number;
  public preserveDrawingBuffer: boolean;
  public pixelRatio: number;
  public prefferedContext: string;
  public canvas: HTMLCanvasElement;
  public viewport: Viewport;
  public autoClear: boolean;
  public clearColor: ClearColor;

  constructor(options?: Options) {
    // Default renderer settings
    this.width = RENDERER_DEFAULT_WIDTH;
    this.height = RENDERER_DEFAULT_HEIGHT;
    this.ratio = RENDERER_DEFAULT_WIDTH / RENDERER_DEFAULT_HEIGHT;
    this.preserveDrawingBuffer = false;
    this.pixelRatio = 1;
    this.prefferedContext = RENDERER_DEFAULT_CONTEXT;
    this.autoClear = true;
    this.clearColor = { r: 0, g: 0, b: 0, a: 1 };

    // Apply defaults
    Object.assign(this, options);

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Try initialising gl
    // NOTE:
    // WebGLContextAttributes 
    // stencil : default false
    // preserveDrawingBuffer: 如果它的值是true，缓冲区将不会被清零，直到被清除或由作者改写将保留它们的值。默认情况下，它的值是false
    const attributes = {
      preserveDrawingBuffer: this.preserveDrawingBuffer
    };

    const detect = Detect();

    if (detect) {
      let contextType;
      if (detect.webgl2 && this.prefferedContext === WEBGL2_CONTEXT) {
        contextType = WEBGL2_CONTEXT;
        const _gl = this.canvas.getContext( 'webgl2', attributes) as WebGL2RenderingContext;
        GL.set(_gl, contextType);
      } else {
        contextType = WEBGL_CONTEXT;
        const _gl =
          (this.canvas.getContext( 'webgl', attributes) as WebGLRenderingContext) ||
          (this.canvas.getContext( 'experimental-webgl', attributes) as WebGLRenderingContext);
        GL.set(_gl, contextType);
      }
    } else {
      warn('Webgl not supported');
      return;
    }

    // NOTE:
    // mudium and version are fixed here
    log(
      `%c${'medium'} ${'0.0.1'} webgl${GL.webgl2 ? 2 : ''}`,
      'padding: 1px; background: #222; color: #ff00ff'
    );

    gl = GL.get();

    // Log Capabilities of gpu
    Capabilities.set(gl);

    // Setup global uniform buffers
    if (GL.webgl2) {
      UniformBuffers.setup();
    }

    // log("capabilities", Capabilities.capabilities);
    // log("extensions", Capabilities.extensions);

    this.viewport = {
      x: 0,
      y: 0,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight
    };

    this.setClearColor();
    gl.enable(gl.DEPTH_TEST);
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

      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.setViewport(0, 0, width, height);
    }
  }

  public setDevicePixelRatio(ratio = 1) {
    this.pixelRatio = ratio;
    this.setSize(this.width, this.height);
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

  public render(
    scene: Scene,
    camera: Camera | PerspectiveCamera | OrthorgraphicCamera
  ) {
    gl = GL.get();

    gl.viewport(
      this.viewport.x,
      this.viewport.y,
      this.viewport.width,
      this.viewport.height
    );

    gl.clearColor(
      this.clearColor.r,
      this.clearColor.g,
      this.clearColor.b,
      this.clearColor.a
    );

    if (this.autoClear) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    // Update the scene
    scene.update();

    // Draw the scene objects
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
  }
}
