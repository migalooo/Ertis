import Geometry from './Geometry';

export default class Plane extends Geometry {
  constructor(
    width = 1,
    height = 1,
    subdivisionsX = 1,
    subdivisionsY = 1,
    axis = 'XY',
    colors?: Float32Array
  ) {
    // https://github.com/yiwenl/Alfrid/blob/master/src/alfrid/Geom.js#L9

    // Note triangles are seperate...

    let vertices = [];
    const indices = [];
    let normals = [];
    let uvs = [];
    let index = 0;

    const spacerX = width / subdivisionsX;
    const spacerY = height / subdivisionsY;
    const offsetX = -width * 0.5;
    const offsetY = -height * 0.5;
    const spacerU = 1 / subdivisionsX;
    const spacerV = 1 / subdivisionsY;

    for (let y = 0; y < subdivisionsY; y += 1) {
      for (let x = 0; x < subdivisionsX; x += 1) {
        const triangleX = spacerX * x + offsetX;
        const triangleY = spacerY * y + offsetY;

        const u = x / subdivisionsX;
        const v = y / subdivisionsY;

        switch (axis) {
          case 'XZ': {
            // Facing towards y
            vertices = vertices.concat([triangleX, 0, triangleY]);
            vertices = vertices.concat([triangleX + spacerX, 0, triangleY]);
            vertices = vertices.concat([
              triangleX + spacerX,
              0,
              triangleY + spacerY
            ]);
            vertices = vertices.concat([triangleX, 0, triangleY + spacerY]);

            normals = normals.concat([0, 1, 0]);
            normals = normals.concat([0, 1, 0]);
            normals = normals.concat([0, 1, 0]);
            normals = normals.concat([0, 1, 0]);

            uvs = uvs.concat([u, 1 - v]);
            uvs = uvs.concat([u + spacerU, 1 - v]);
            uvs = uvs.concat([u + spacerU, 1 - (v + spacerV)]);
            uvs = uvs.concat([u, 1 - (v + spacerV)]);
            break;
          }
          case 'YZ': {
            // Facing towards x

            vertices = vertices.concat([0, triangleY, triangleX]);
            vertices = vertices.concat([0, triangleY, triangleX + spacerX]);
            vertices = vertices.concat([
              0,
              triangleY + spacerY,
              triangleX + spacerX
            ]);
            vertices = vertices.concat([0, triangleY + spacerY, triangleX]);

            normals = normals.concat([1, 0, 0]);
            normals = normals.concat([1, 0, 0]);
            normals = normals.concat([1, 0, 0]);
            normals = normals.concat([1, 0, 0]);

            uvs = uvs.concat([1 - u, v]);
            uvs = uvs.concat([1 - (u + spacerU), v]);
            uvs = uvs.concat([1 - (u + spacerU), v + spacerV]);
            uvs = uvs.concat([1 - u, v + spacerV]);
            break;
          }
          default: {
            // Facing towards z
            vertices = vertices.concat([triangleX, triangleY, 0]);
            vertices = vertices.concat([triangleX + spacerX, triangleY, 0]);
            vertices = vertices.concat([
              triangleX + spacerX,
              triangleY + spacerY,
              0
            ]);
            vertices = vertices.concat([triangleX, triangleY + spacerY, 0]);

            normals = normals.concat([0, 0, 1]);
            normals = normals.concat([0, 0, 1]);
            normals = normals.concat([0, 0, 1]);
            normals = normals.concat([0, 0, 1]);

            uvs = uvs.concat([u, v]);
            uvs = uvs.concat([u + spacerU, v]);
            uvs = uvs.concat([u + spacerU, v + spacerV]);
            uvs = uvs.concat([u, v + spacerV]);
          }
        }

        indices.push(index * 4 + 0);
        indices.push(index * 4 + 1);
        indices.push(index * 4 + 2);
        indices.push(index * 4 + 0);
        indices.push(index * 4 + 2);
        indices.push(index * 4 + 3);

        index += 1;
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
