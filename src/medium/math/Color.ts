import { vec3 } from 'gl-matrix';

export default class Color {
  public v: vec3;

  constructor(hex = 0xffffff) {
    this.v = vec3.create();
    this.convert(hex);
    return this;
  }
  set r(value: number) {
    this.v[0] = value;
  }
  get r() {
    return this.v[0];
  }
  set g(value: number) {
    this.v[1] = value;
  }
  get g() {
    return this.v[1];
  }
  set b(value: number) {
    this.v[2] = value;
  }
  get b() {
    return this.v[2];
  }
  public set(r: number, g: number, b: number) {
    vec3.set(this.v, r, g, b);
    return this;
  }
  public copy(rgb: number[]) {
    vec3.copy(this.v, vec3.fromValues(rgb[0], rgb[1], rgb[2]));
    return this;
  }
  public convert(hex: string | number) {
    let rgb;
    if (typeof hex === 'number') {
      rgb = this.hexIntToRgb(hex);
    }
    if (typeof hex === 'string') {
      rgb = this.hexStringToRgb(hex);
    }
    vec3.copy(this.v, this.normalize(rgb));
    return this;
  }
  public normalize(array: number[]) {
    return vec3.fromValues(array[0] / 255, array[1] / 255, array[2] / 255);
  }
  public fromArray(array: number[]) {
    this.set(array[0], array[1], array[2]);
  }
  public componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }
  public rgbToHex(r: number, g: number, b: number) {
    const hexR = this.componentToHex(r);
    const hexG = this.componentToHex(g);
    const hexB = this.componentToHex(b);
    return `#${hexR}${hexG}${hexB}`;
  }
  public hexIntToRgb(hex: number) {
    const r = hex >> 16;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return vec3.fromValues(r, g, b);
  }
  public hexStringToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? vec3.fromValues(
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        )
      : null;
  }
}
