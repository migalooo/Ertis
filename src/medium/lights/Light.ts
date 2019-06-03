export default class Light {
  public type: string;
  public data: Float32Array;

  public update() {
    return;
  }

  public setValues(values: number[] | Float32Array, offset = 0) {
    this.data.set(values, offset);
  }
}
