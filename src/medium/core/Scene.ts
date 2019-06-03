import { mat4 } from 'gl-matrix';
import Mesh from '../core/Mesh';
import Lights from '../lights/Lights';

export default class Scene {
  public objects: Mesh[];
  public ambientLight: Lights;
  public pointLights: Lights;
  public directionalLights: Lights;

  constructor() {
    this.objects = [];
    this.pointLights = undefined;
    this.directionalLights = undefined;
  }

  public add(object: Mesh) {
    this.objects.push(object);
  }

  public remove(object: Mesh, dispose = false) {
    const objectIndex = this.objects.indexOf(object);
    if (objectIndex !== -1) {
      this.objects.splice(objectIndex, 1);
      if (dispose) {
        object.dispose();
        object = undefined;
      }
    }
  }

  public update() {
    if (this.ambientLight) {
      this.ambientLight.update();
      this.ambientLight.bind();
    }
    if (this.directionalLights) {
      this.directionalLights.update();
      this.directionalLights.bind();
    }
    if (this.pointLights) {
      this.pointLights.update();
      this.pointLights.bind();
    }
  }
}
