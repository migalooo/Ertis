import { vec3 } from 'gl-matrix';
import Vector3 from '../math/Vector3';
const cb = vec3.create();
const ab = vec3.create();

export default class Face {
  public indices: number[];
  public vertices: Vector3[];
  public uvs: number[];
  public normal: Vector3;

  constructor(
    indiceA: number,
    indiceB: number,
    indiceC: number,
    vertexA: Vector3,
    vertexB: Vector3,
    vertexC: Vector3
  ) {
    this.indices = [indiceA, indiceB, indiceC];
    this.vertices = [vertexA, vertexB, vertexC];
    this.uvs = [indiceA, indiceB, indiceC];
    this.normal = new Vector3();
    this.updateFaceNormal();
  }

  public updateFaceNormal() {
    // from threejs
    vec3.set(cb, 0, 0, 0);
    vec3.set(ab, 0, 0, 0);
    vec3.subtract(cb, this.vertices[2].v, this.vertices[1].v);
    vec3.subtract(ab, this.vertices[0].v, this.vertices[1].v);
    vec3.cross(cb, cb, ab);

    vec3.normalize(cb, cb);
    this.normal.set(cb[0], cb[1], cb[2]);
  }
}
