import { mat4 } from 'gl-matrix';
import { RENDERER_DEFAULT_RATIO } from '../core/Constants';
import Vector3 from '../math/Vector3';
import Camera from './Camera';

interface Options {
  near?: number;
  far?: number;
  fov?: number;
  position?: Vector3;
  target?: Vector3;
  up?: Vector3;
}

export default class PerspectiveCamera extends Camera {
  constructor(options: Options) {
    super(options);
    this.isPespectiveCamera = true;
  }

  public updateProjectionMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.near,
      this.far
    );
  }
}
