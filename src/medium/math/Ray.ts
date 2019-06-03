import { vec3 } from 'gl-matrix';
import Sphere from './Sphere';
import Vector3 from './Vector3';

const diff = vec3.create();
const edge1 = vec3.create();
const edge2 = vec3.create();
const normal = vec3.create();
const v1 = vec3.create();

export default class Ray {
  public origin: Vector3;
  public direction: Vector3;

  constructor() {
    this.origin = new Vector3();
    this.direction = new Vector3();
  }

  public set(origin: Vector3, direction: Vector3) {
    this.origin.copy(origin);
    this.direction.copy(direction);
  }

  public intersectTriangle(a: Vector3, b: Vector3, c: Vector3, culling = true) {
    vec3.sub(edge1, b.v, a.v);
    vec3.sub(edge2, c.v, a.v);
    vec3.cross(normal, edge1, edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)

    // console.log('normal', normal);
    let DdN = vec3.dot(this.direction.v, normal);
    let sign;

    // console.log('normal', normal);

    if (DdN > 0) {
      if (culling) return null;
      sign = 1;
    } else if (DdN < 0) {
      sign = -1;
      DdN = -DdN;
    } else {
      return null;
    }

    vec3.sub(diff, this.origin.v, a.v);
    vec3.cross(edge2, diff, edge2);
    const DdQxE2 = sign * vec3.dot(this.direction.v, edge2);

    // b1 < 0, no intersection
    if (DdQxE2 < 0) {
      return null;
    }

    vec3.cross(edge1, edge1, diff);
    const DdE1xQ = sign * vec3.dot(this.direction.v, edge1);

    // b2 < 0, no intersection
    if (DdE1xQ < 0) {
      return null;
    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    const QdN = -sign * vec3.dot(diff, normal);

    // t < 0, no intersection
    if (QdN < 0) {
      return null;
    }

    const result = new Vector3();
    result
      .copy(this.direction)
      .scale(QdN / DdN)
      .add(this.origin);

    return result;
  }

  public at(scale: number) {
    const result = vec3.fromValues(
      this.direction.v[0],
      this.direction.v[1],
      this.direction.v[2]
    );
    vec3.scale(result, result, scale);
    vec3.add(result, result, this.origin.v);
  }

  public intersectsSphere(sphere) {
    return this.distanceToPoint(sphere.center) <= sphere.radius;
  }

  public distanceToPoint(point) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }

  public distanceSqToPoint(point: Vector3) {
    vec3.subtract(v1, point.v, this.origin.v);
    const directionDistance = vec3.dot(v1, this.direction.v);

    // point behind the ray
    if (directionDistance < 0) {
      return vec3.squaredDistance(this.origin.v, point.v);
    }

    vec3.copy(v1, this.direction.v);
    vec3.scale(v1, v1, directionDistance);
    vec3.add(v1, v1, this.origin.v);

    return vec3.squaredDistance(v1, point.v);
  }
}
