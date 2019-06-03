import { LIGHT_POINT } from '../core/Constants';
import * as GL from '../core/GL';
import Color from '../math/Color';
import Vector3 from '../math/Vector3';
import Light from './Light';

export default class PointLight extends Light {
  public uniforms: any;
  public position: Vector3;

  constructor(uniforms = {}) {
    super();
    this.type = LIGHT_POINT;
    this.uniforms = {
      position: {
        type: '3f',
        value: new Vector3(0, 0, 0).v
      },
      color: {
        type: '3f',
        value: new Color(0xffffff).v
      },
      specularColor: {
        type: '3f',
        value: new Color(0xffffff).v
      },
      shininess: {
        type: 'f',
        value: 100
      },
      intensity: {
        type: 'f',
        value: 1
      }
    };
    Object.assign(this.uniforms, uniforms);

    this.position = new Vector3();

    if (GL.webgl2) {
      // Buffer data
      this.data = new Float32Array([
        ...this.uniforms.position.value,
        0.0,
        ...this.uniforms.color.value,
        0.0,
        ...this.uniforms.specularColor.value,
        0.0,
        this.uniforms.shininess.value,
        0.0,
        0.0,
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
      this.setValues(this.position.v);
      this.setValues(this.uniforms.color.value, 4);
      this.setValues(this.uniforms.specularColor.value, 8);
      this.setValues([this.uniforms.shininess.value], 12);
      this.setValues([this.uniforms.intensity.value], 16);
    } else {
      this.uniforms.position.value.set(this.position.v);
    }
  }
}
