import { mat4, quat, vec3 } from 'gl-matrix';

import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { lookAt } from '../math/Utils';
import Vector3 from '../math/Vector3';

let axisAngle = 0;
const quaternionAxisAngle = vec3.create();

export default class Object3D {
  public children: Object3D[];
  public localMatrix: mat4;
  public modelMatrix: mat4;
  public modelViewMatrix: mat4;
  public position: Vector3;
  public rotation: Vector3;
  public scale: Vector3;
  public isObject3D: boolean;
  public parent: Object3D;
  public matrixAutoUpdate: boolean;
  public quaternion: quat;
  public quaternionLookAt: quat;
  public lookAtUp: vec3;

  constructor() {
    this.children = [];
    this.localMatrix = mat4.create();
    this.modelMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.matrixAutoUpdate = true;
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.isObject3D = true;
    this.quaternion = quat.create();
    this.quaternionLookAt = quat.create();
    this.lookAtUp = vec3.create(); // needs to be [0, 0, 0] although it should be [0, 1, 0]
  }

  public updateMatrix(camera: Camera | PerspectiveCamera | OrthographicCamera) {
    mat4.identity(this.modelViewMatrix);

    if (this.matrixAutoUpdate) {
      // Reset
      mat4.identity(this.localMatrix);
      mat4.identity(this.modelMatrix);
      quat.identity(this.quaternion);

      // If Object3D has a parent, copy the computed modelMatrix into localMatrix
      if (this.parent) {
        mat4.copy(this.localMatrix, this.parent.modelMatrix);
        mat4.multiply(this.modelMatrix, this.modelMatrix, this.localMatrix);
      }

      // Use lookAt quat as base
      // Note: this.rotation isn't updated if lookAt's used
      quat.copy(this.quaternion, this.quaternionLookAt);

      // Apply local transitions to modelMatrix
      mat4.translate(this.modelMatrix, this.modelMatrix, this.position.v);
      quat.rotateX(this.quaternion, this.quaternion, this.rotation.x);
      quat.rotateY(this.quaternion, this.quaternion, this.rotation.y);
      quat.rotateZ(this.quaternion, this.quaternion, this.rotation.z);
      axisAngle = quat.getAxisAngle(quaternionAxisAngle, this.quaternion);
      mat4.rotate(
        this.modelMatrix,
        this.modelMatrix,
        axisAngle,
        quaternionAxisAngle
      );
      mat4.scale(this.modelMatrix, this.modelMatrix, this.scale.v);
    }

    // Model View Matrix
    if (camera) {
      mat4.multiply(
        this.modelViewMatrix,
        camera.worldInverseMatrix,
        this.modelMatrix
      );
    }
  }

  public lookAt(target: Vector3) {
    quat.identity(this.quaternionLookAt);
    this.quaternionLookAt = lookAt(this.position.v, target.v, this.lookAtUp);
  }

  public setParent(parent: Object3D) {
    this.unParent();
    if (parent.isObject3D) {
      parent.children.push(this);
      this.parent = parent;
    }
  }

  public unParent() {
    if (this.parent === undefined) return;
    const objectIndex = this.parent.children.indexOf(this);
    if (objectIndex !== -1) {
      this.parent.children.splice(objectIndex, 1);
      this.parent = null;
    }
  }

  public dispose() {
    this.unParent();
    this.children = [];
    this.localMatrix = null;
    this.modelMatrix = null;
    this.position = null;
    this.rotation = null;
    this.scale = null;
    this.quaternion = null;
    this.isObject3D = null;
  }
}
