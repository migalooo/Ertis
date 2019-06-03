import Geometry from './Geometry';

export default class Box extends Geometry {
  constructor(width = 1, height = 1, depth = 1, colors?: Float32Array) {
    // this.colors = [];

    // Screenspace
    /*
			(-1, 1)  (0, 1)  (1, 1)

			(-1, 0)  (0, 0)  (1, 0)

			(-1,-1)  (0,-1)  (1,-1)
			*/

    const vertices = [
      // Front face
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,

      // Back face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,

      // Top face
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,

      // Bottom face
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      -1.0,
      -1.0,
      1.0,

      // Right face
      1.0,
      -1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      -1.0,
      1.0,

      // Left face
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      -1.0,
      1.0,
      -1.0,
      1.0,
      1.0,
      -1.0,
      1.0,
      -1.0
    ];

    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] *= width;
      vertices[i + 1] *= height;
      vertices[i + 2] *= depth;
    }

    const indices = [
      0,
      1,
      2,
      0,
      2,
      3, // Front face
      4,
      5,
      6,
      4,
      6,
      7, // Back face
      8,
      9,
      10,
      8,
      10,
      11, // Top face
      12,
      13,
      14,
      12,
      14,
      15, // Bottom face
      16,
      17,
      18,
      16,
      18,
      19, // Right face
      20,
      21,
      22,
      20,
      22,
      23 // Left face
    ];

    const normals = [
      // Front
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,

      // Back
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,

      // Top
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,

      // Bottom
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,

      // Right
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0,

      // Left
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0,
      -1.0,
      0.0,
      0.0
    ];

    const uvs = [
      // Front face
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      // Back face
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      0.0,
      0.0,
      // Top face
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      // Bottom face
      1.0,
      1.0,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      0.0,
      // Right face
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0,
      0.0,
      0.0,
      // Left face
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      1.0,
      0.0,
      1.0
    ];

    super(
      new Float32Array(vertices),
      new Uint16Array(indices),
      new Float32Array(normals),
      new Float32Array(uvs),
      colors
    );
  }
}
