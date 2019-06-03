import { vec2 } from 'gl-matrix';

export default class Vector2 {
  public v: vec2;

  constructor(x = 0, y = 0) {
    this.v = vec2.create();
    this.set(x, y);
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
  public set(x: number, y: number) {
    vec2.set(this.v, x, y);
    return this;
  }
  public clone() {
    return new Vector2(this.v[0], this.v[1]);
  }
  public copy(vector2: Vector2) {
    vec2.copy(this.v, vector2.v);
    return this;
  }
  public add(vector2: Vector2) {
    vec2.add(this.v, this.v, vector2.v);
    return this;
  }
  public subtract(vector2: Vector2) {
    vec2.subtract(this.v, this.v, vector2.v);
    return this;
  }
  public subtractVectors(vector0: Vector2, vector1: Vector2) {
    const out = vec2.create();
    vec2.subtract(out, vector0.v, vector1.v);
    return out;
  }
  public scale(value: number) {
    vec2.scale(this.v, this.v, value);
    return this;
  }
  public distance(vector2: Vector2) {
    return vec2.distance(this.v, vector2.v);
  }
  public length(): number {
    return vec2.length(this.v);
  }
  public negate() {
    vec2.negate(this.v, this.v);
    return this;
  }
  public normalize() {
    vec2.normalize(this.v, this.v);
    return this;
  }
  public lerp(vector2: Vector2, value: number) {
    vec2.lerp(this.v, this.v, vector2.v, value);
    return this;
  }
  public equals(vector2: Vector2): boolean {
    return vec2.equals(this.v, vector2.v);
  }
  public multiply(vector2: Vector2) {
    this.v[0] *= vector2.v[0];
    this.v[1] *= vector2.v[1];
    return this;
  }
  public fromArray(values: number[]) {
    return vec2.copy(this.v, values);
  }
}
