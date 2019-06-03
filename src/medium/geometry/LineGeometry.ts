import Geometry from './Geometry';

export default class LineGeometry extends Geometry {
  constructor(bufferVertices: number[] | Float32Array) {
    const vertices = [];
    let i3 = 0;
    let i6 = 0;
    const length = bufferVertices.length / 3;
    for (let i = 0; i < length; i += 1) {
      i3 = i * 3;
      i6 = i * 6;
      if (i < length - 1) {
        vertices[i6] = bufferVertices[i3];
        vertices[i6 + 1] = bufferVertices[i3 + 1];
        vertices[i6 + 2] = bufferVertices[i3 + 2];
        vertices[i6 + 3] = bufferVertices[i3 + 3];
        vertices[i6 + 4] = bufferVertices[i3 + 4];
        vertices[i6 + 5] = bufferVertices[i3 + 5];
      }
    }
    super(new Float32Array(vertices));
  }
}
