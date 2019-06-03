import {
  LIGHT_AMBIENT,
  LIGHT_DIRECTIONAL,
  LIGHT_POINT,
  UNIFORM_AMBIENT_LIGHT_LOCATION,
  UNIFORM_DIRECTIONAL_LIGHTS_LOCATION,
  UNIFORM_POINT_LIGHTS_LOCATION
} from '../core/Constants';
import * as GL from '../core/GL';
import UniformBuffer from '../core/UniformBuffer';
import AmbientLight from '../lights/AmbientLight';
import DirectionalLight from '../lights/DirectionalLight';
import PointLight from '../lights/PointLight';

let gl;

/**
	* Genetic class for PointLights and DirectionalLights
	* Creates a uniform buffer which stores all the data for the specific
	* light type
	*/
export default class Lights {
  public lights: Array<DirectionalLight | PointLight | AmbientLight>;
  public uniformBuffer: UniformBuffer;
  public _lightsData: Float32Array;

  constructor(lights: Array<AmbientLight | DirectionalLight | PointLight>) {
    this.lights = lights;

    gl = GL.get();

    if (GL.webgl2) {
      const dataLength = this.lights[0].data.length;

      // Setup data
      const values = Array(lights.length * dataLength);
      const data = new Float32Array(values);

      // Create uniform buffer to store all point lights data
      // The uniform block is an array of lights
      this.uniformBuffer = new UniformBuffer(data);

      // Tmp array for updating the lights data buffer
      this._lightsData = new Float32Array(
        lights[0].data.length * lights.length
      );
    }
  }

  get length() {
    return this.lights.length;
  }

  public get() {
    return this.lights;
  }

  public update() {
    if (GL.webgl2) {
      // Get data from lights and update the uniform buffer
      this.lights.forEach((light, i) => {
        light.update();
        this._lightsData.set(light.data, i * light.data.length);
      });
      this.uniformBuffer.setValues(this._lightsData, 0);
    } else {
      this.lights.forEach(light => {
        light.update();
      });
    }
  }

  public bind() {
    if (GL.webgl2) {
      gl = GL.get();

      gl.bindBuffer(gl.UNIFORM_BUFFER, this.uniformBuffer.buffer);
      gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.uniformBuffer.data);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }
  }
}
