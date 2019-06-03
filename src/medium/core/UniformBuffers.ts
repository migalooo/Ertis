import { mat4 } from 'gl-matrix';
import UniformBuffer from './UniformBuffer';

// Global uniform buffers
const uniformBuffers: any = {};

// Create buffers when gl context is ready
export function setup() {
  // ProjectionView
  const projectionViewData = new Float32Array(mat4.create());

  uniformBuffers.projectionView = new UniformBuffer(projectionViewData);
}

// Update projectionView buffer data
export function updateProjectionView(
  gl: WebGL2RenderingContext,
  projectionMatrix: mat4
) {
  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, uniformBuffers.projectionView.buffer);
  gl.bindBuffer(gl.UNIFORM_BUFFER, uniformBuffers.projectionView.buffer);

  const projectionViewData = [...projectionMatrix];

  uniformBuffers.projectionView.data.set(projectionViewData, 0);

  gl.bufferSubData(gl.UNIFORM_BUFFER, 0, uniformBuffers.projectionView.data);
  gl.bindBuffer(gl.UNIFORM_BUFFER, null);
}

export default uniformBuffers;
