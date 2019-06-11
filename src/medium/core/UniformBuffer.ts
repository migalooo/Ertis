import { createUniformBuffer } from './GL';

export default class UniformBuffer {
  public data: Float32Array;
  public buffer: WebGLBuffer;

  constructor(data: Float32Array) {
    this.data = data;
    this.buffer = createUniformBuffer(data);
  }

  public setValues(values: Float32Array, offset = 0) {
    this.data.set(values, offset);
  }
}
