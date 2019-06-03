import { mat4 } from 'gl-matrix';
import Vector3 from '../math/Vector3';
import Camera from './Camera';

interface Options {
  left?: number;
  right?: number;
  bottom?: number;
  top?: number;
  near?: number;
  far?: number;
  fov?: number;
  position?: Vector3;
  target?: Vector3;
  up?: Vector3;
}

export default class OrthographicCamera extends Camera {
  public left: number;
  public right: number;
  public bottom: number;
  public top: number;
  constructor(options: Options = {}) {
    super(options);
    this.left = options.left || -1;
    this.right = options.right || 1;
    this.bottom = options.bottom || -1;
    this.top = options.top || 1;
    this.isOrthographicCamera = true;
  }

  public updateProjectionMatrix() {
    mat4.ortho(
      this.projectionMatrix,
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far
    );
  }
}
