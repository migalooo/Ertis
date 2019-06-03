import { mat4, vec2, vec3 } from 'gl-matrix';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import Face from '../geometry/Face';
import Ray from '../math/Ray';
import Sphere from '../math/Sphere';
import { barycoordFromPoint } from '../math/Utils';
import Vector2 from '../math/Vector2';
import Vector3 from '../math/Vector3';
import Mesh from './Mesh';
import Scene from './Scene';

const inversedProjectionViewMatrix: mat4 = mat4.create();
const cameraDirection: vec3 = vec3.create();
const directionVector = new Vector3();

let barycoord: Vector3;
const fvA = new Vector3();
const fvB = new Vector3();
const fvC = new Vector3();
const uvA = new Vector2();
const uvB = new Vector2();
const uvC = new Vector2();
const sphere = new Sphere();

export default class RayCaster {
  public ray: Ray;
  public near: number;
  public far: number;

  constructor(origin: Vector3, direction: Vector3, near: number, far: number) {
    this.ray = new Ray();
    this.near = near || 0;
    this.far = far || Infinity;
  }

  public setFromCamera(
    coords: Vector2,
    scene: Scene,
    camera: PerspectiveCamera,
    object: Mesh
  ) {
    if (camera && camera.isPespectiveCamera) {
      this.ray.origin.copy(camera.position);

      vec3.copy(cameraDirection, [coords.x, coords.y, 0.5]);

      mat4.multiply(
        inversedProjectionViewMatrix,
        camera.projectionMatrix,
        camera.worldInverseMatrix
      );
      mat4.invert(inversedProjectionViewMatrix, inversedProjectionViewMatrix);

      vec3.transformMat4(
        cameraDirection,
        cameraDirection,
        inversedProjectionViewMatrix
      );

      vec3.sub(cameraDirection, cameraDirection, camera.position.v);
      vec3.normalize(cameraDirection, cameraDirection);

      directionVector.set(
        cameraDirection[0],
        cameraDirection[1],
        cameraDirection[2]
      );

      this.ray.direction.copy(directionVector);
    }
  }

  public uvIntersection(point: Vector3, v0: Vector3, v1: Vector3, v2: Vector3) {
    barycoord = barycoordFromPoint(point.v, v0.v, v1.v, v2.v);
    uvA.scale(barycoord.x);
    uvB.scale(barycoord.y);
    uvC.scale(barycoord.z);
    uvA.add(uvB).add(uvC);
    return uvA.clone();
  }

  public intersectObject(object: Mesh) {
    if (!object.visible) return;
    let intersect;
    let uv;
    let face;

    // Check sphere
    if (object.boundingSphere === undefined) object.computeBoundingSphere();
    sphere.copy(object.boundingSphere);
    // Apply object modelMatrix, incase object has been transformed
    sphere.applyMatrix(object.modelMatrix);

    // Exit if the ray doesn't intersect the sphere
    if (!this.ray.intersectsSphere(sphere)) {
      return;
    }

    for (const f of object.geometry.faces) {
      vec3.copy(fvA.v, f.vertices[0].v);
      vec3.copy(fvB.v, f.vertices[1].v);
      vec3.copy(fvC.v, f.vertices[2].v);

      // Multiply vertices by object matrix
      vec3.transformMat4(fvA.v, fvA.v, object.modelMatrix);
      vec3.transformMat4(fvB.v, fvB.v, object.modelMatrix);
      vec3.transformMat4(fvC.v, fvC.v, object.modelMatrix);

      intersect = this.ray.intersectTriangle(fvA, fvB, fvC);

      if (intersect) {
        // Get uv intersection
        vec2.copy(uvA.v, object.geometry.uvs[f.uvs[0]].v);
        vec2.copy(uvB.v, object.geometry.uvs[f.uvs[1]].v);
        vec2.copy(uvC.v, object.geometry.uvs[f.uvs[2]].v);
        face = f;
        uv = this.uvIntersection(intersect, fvA, fvB, fvC);
        break;
      }
    }

    return intersect ? { point: intersect, uv, face } : null;
  }
}
