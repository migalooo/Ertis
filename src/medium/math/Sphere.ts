import { mat4, vec3 } from 'gl-matrix';
import Vector3 from './Vector3';

export default class Sphere {
  public center: Vector3;
  public radius: number;

  constructor(center: Vector3 = new Vector3(), radius: number = 0) {
    this.center = center;
    this.radius = radius;
  }

  public copy(sphere: Sphere) {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
  }

  public applyMatrix(matrix: mat4) {
    vec3.transformMat4(this.center.v, this.center.v, matrix);
    const scaling = mat4.getScaling(vec3.create(), matrix);
    this.radius *= Math.max(scaling[0], scaling[1], scaling[2]);
  }
}
