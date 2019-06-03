import { LIGHT_AMBIENT } from '../core/Constants';
import * as GL from '../core/GL';
import Color from '../math/Color';
import Vector3 from '../math/Vector3';
import Light from './Light';

export default class AmbientLight extends Light {
  public uniforms: any;
  public position: Vector3;

  constructor(uniforms = {}) {
    super();
    this.type = LIGHT_AMBIENT;
    this.uniforms = {
      color: {
        type: '3f',
        value: new Color(0x404040).v
      },
      intensity: {
        type: 'f',
        value: 0.1
      }
    };
    Object.assign(this.uniforms, uniforms);

    if (GL.webgl2) {
      // Buffer data
      this.data = new Float32Array([
        ...this.uniforms.color.value,
        0.0,
        this.uniforms.intensity.value,
        0.0,
        0.0,
        0.0
      ]);
    }
  }

  public update() {
    if (GL.webgl2) {
      // Set values for buffer data
      this.setValues(this.uniforms.color.value, 0);
      this.setValues([this.uniforms.intensity.value], 4);
    }
  }
}
