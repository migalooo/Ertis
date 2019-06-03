import Geometry from './Geometry';

export default class SphereGeometry extends Geometry {
  constructor(
    radius = 1,
    axisDivisions = 8,
    heightDivisons = 8,
    colors?: Float32Array
  ) {
    // https://github.com/gpjt/webgl-lessons/blob/master/lesson12/index.html

    const vertices = [];
    const normals = [];
    const uvs = [];
    for (let axisNumber = 0; axisNumber <= axisDivisions; axisNumber += 1) {
      const theta = axisNumber * Math.PI / axisDivisions;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (
        let heightNumber = 0;
        heightNumber <= heightDivisons;
        heightNumber += 1
      ) {
        const phi = heightNumber * 2 * Math.PI / heightDivisons;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        const u = 1 - heightNumber / heightDivisons;
        const v = 1 - axisNumber / axisDivisions;
        normals.push(x);
        normals.push(y);
        normals.push(z);
        uvs.push(u);
        uvs.push(v);
        vertices.push(radius * x);
        vertices.push(radius * y);
        vertices.push(radius * z);
      }
    }

    const indices = [];
    for (let axisNumber = 0; axisNumber < axisDivisions; axisNumber += 1) {
      for (
        let heightNumber = 0;
        heightNumber < heightDivisons;
        heightNumber += 1
      ) {
        const first = axisNumber * (heightDivisons + 1) + heightNumber;
        const second = first + heightDivisons + 1;
        indices.push(first);
        indices.push(second);
        indices.push(first + 1);
        indices.push(second);
        indices.push(second + 1);
        indices.push(first + 1);
      }
    }

    super(
      new Float32Array(vertices),
      new Uint16Array(indices),
      new Float32Array(normals),
      new Float32Array(uvs),
      colors
    );
  }
}
