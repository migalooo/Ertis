import { vec3 } from 'gl-matrix';

export default class Vector3 {
  public static up = new Vector3(0, 1, 0);
  public v: vec3;
  constructor(x = 0, y = 0, z = 0) {
    this.v = vec3.create();
    this.set(x, y, z);
    return this;
  }
  set x(value: number) {
    this.v[0] = value;
  }
  get x() {
    return this.v[0];
  }
  set y(value: number) {
    this.v[1] = value;
  }
  get y() {
    return this.v[1];
  }
  set z(value: number) {
    this.v[2] = value;
  }
  get z() {
    return this.v[2];
  }
  public set(x: number, y: number, z: number) {
    vec3.set(this.v, x, y, z);
    return this;
  }
  public clone() {
    return new Vector3(this.v[0], this.v[1], this.v[2]);
  }
  public copy(vector3: Vector3) {
    vec3.copy(this.v, vector3.v);
    return this;
  }
  public add(vector3: Vector3) {
    vec3.add(this.v, this.v, vector3.v);
    return this;
  }
  public subtract(vector3: Vector3) {
    vec3.subtract(this.v, this.v, vector3.v);
    return this;
  }
  public subtractVectors(vector0: Vector3, vector1: Vector3) {
    const out = vec3.create();
    vec3.subtract(out, vector0.v, vector1.v);
    return out;
  }
  public scale(value: number) {
    vec3.scale(this.v, this.v, value);
    return this;
  }
  public distance(vector3: Vector3) {
    return vec3.distance(this.v, vector3.v);
  }
  public length(): number {
    return vec3.length(this.v);
  }
  public negate() {
    vec3.negate(this.v, this.v);
    return this;
  }
  public normalize() {
    vec3.normalize(this.v, this.v);
    return this;
  }
  public dot(vector3: Vector3): number {
    return vec3.dot(this.v, vector3.v);
  }
  public cross(vector3: Vector3) {
    vec3.cross(this.v, this.v, vector3.v);
    return this;
  }
  public crossVectors(vector0: Vector3, vector1: Vector3) {
    const out = vec3.create();
    vec3.cross(out, vector0.v, vector1.v);
    return out;
  }
  public lerp(vector3: Vector3, value: number) {
    vec3.lerp(this.v, this.v, vector3.v, value);
    return this;
  }
  public equals(vector3: Vector3): boolean {
    return vec3.equals(this.v, vector3.v);
  }
  public multiply(vector3: Vector3) {
    this.v[0] *= vector3.v[0];
    this.v[1] *= vector3.v[1];
    this.v[2] *= vector3.v[2];
    return this;
  }
  public fromArray(values: number[]) {
    return vec3.copy(this.v, values);
  }
}
