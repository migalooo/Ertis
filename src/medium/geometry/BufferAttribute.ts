import * as GL from '../core/GL';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

export default class BufferAttribute {
  public type: number;
  public data: number[];
  public itemSize: number;
  public numItems: number;
  public buffer: WebGLBuffer;
  public shaderAttribute: boolean;

  constructor(
    type: GLenum,
    data: any, // Float32Array | Uint16Array | Uint32Array, (typings are wrong for createBuffer)
    itemSize: number,
    shaderAttribute = true
  ) {
    this.type = type;
    this.itemSize = itemSize;
    this.numItems = data.length / itemSize;
    this.buffer = GL.createBuffer(type, data);
    this.shaderAttribute = shaderAttribute;
  }

  public bind() {
    gl = GL.get();
    gl.bindBuffer(this.type, this.buffer);
  }

  public unbind() {
    gl = GL.get();
    gl.bindBuffer(this.type, null);
  }

  public update(data: Float32Array) {
    this.bind();
    gl = GL.get();
    gl.bufferSubData(this.type, 0, data);
    this.unbind();
  }

  public dispose() {
    gl = GL.get();
    gl.deleteBuffer(this.buffer);
    this.buffer = null;
  }
}
