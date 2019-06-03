import { extensions } from './Capabilities';
import * as GL from './GL';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

export default class Vao {
  public vao: any;

  constructor() {
    gl = GL.get();
    if (gl instanceof WebGL2RenderingContext) {
      this.vao = gl.createVertexArray();
    } else if (extensions.vertexArrayObject) {
      this.vao = extensions.vertexArrayObject.createVertexArrayOES();
    }
  }

  public bind() {
    if (gl instanceof WebGL2RenderingContext) {
      gl.bindVertexArray(this.vao);
    } else if (extensions.vertexArrayObject) {
      extensions.vertexArrayObject.bindVertexArrayOES(this.vao);
    }
  }

  public unbind() {
    if (gl instanceof WebGL2RenderingContext) {
      gl.bindVertexArray(null);
    } else if (extensions.vertexArrayObject) {
      extensions.vertexArrayObject.bindVertexArrayOES(null);
    }
  }

  public dispose() {
    if (gl instanceof WebGL2RenderingContext) {
      gl.deleteVertexArray(this.vao);
    } else if (extensions.vertexArrayObject) {
      extensions.vertexArrayObject.deleteVertexArrayOES(this.vao);
    }
    this.vao = null;
  }
}
