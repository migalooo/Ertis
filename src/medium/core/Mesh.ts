import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import Geometry from '../geometry/Geometry';
import Sphere from '../math/Sphere';
import { extensions } from './Capabilities';
import * as GL from './GL';
import Material from './Material';
import Object3D from './Object3D';
import Vao from './Vao';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

export default class Mesh extends Object3D {
  public geometry: Geometry;
  public material: Material;
  public vao: Vao;
  public visible: boolean;
  public instanceCount: number;
  public isInstanced: boolean;
  public boundingSphere: Sphere;

  constructor(geometry: Geometry, material: Material) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.vao = new Vao();
    this.visible = true;
    this.instanceCount = 0;
    // Allow meshes to share shaders and programs
    if (!this.material.program.created) {
      this.material.create(this.geometry);
    }
    this.isInstanced = false;

    gl = GL.get();

    // Setup vao
    this.vao.bind();
    this.bindAttributes();
    this.bindAttributesInstanced();
    this.bindIndexBuffer();
    this.vao.unbind();
  }

  public setInstanceCount(value: number) {
    gl = GL.get();
    this.instanceCount = value;
    this.isInstanced = true;
  }

  public bindAttributes() {
    // Attributes
    Object.keys(this.geometry.attributes).forEach(attributeName => {
      if (attributeName !== 'aIndex') {
        // enableVertexAttribArray
        this.material.program.setAttributeLocation(attributeName);
        // Bind buffer
        this.geometry.attributes[attributeName].bind();
        // vertexAttribPointer
        this.material.program.setAttributePointer(
          attributeName,
          this.geometry.attributes[attributeName].itemSize
        );
      }
    });
  }

  public bindAttributesInstanced() {
    // Instanced Attributes
    Object.keys(this.geometry.attributesInstanced).forEach(attributeName => {
      if (attributeName !== 'aIndex') {
        // enableVertexAttribArray
        this.material.program.setAttributeLocation(attributeName);
        // Bind buffer
        this.geometry.attributesInstanced[attributeName].bind();
        // vertexAttribPointer
        this.material.program.setAttributeInstancedPointer(
          attributeName,
          this.geometry.attributesInstanced[attributeName].itemSize
        );
        if (gl instanceof WebGL2RenderingContext) {
          gl.vertexAttribDivisor(
            this.material.program.attributeLocations[attributeName],
            1
          );
        } else {
          extensions.angleInstancedArrays.vertexAttribDivisorANGLE(
            this.material.program.attributeLocations[attributeName],
            1
          );
        }
      }
    });
  }

  public bindIndexBuffer() {
    // Bind index buffer
    if (this.geometry.bufferIndices) {
      this.geometry.attributes.aIndex.bind();
    }
  }

  public draw(camera: Camera | PerspectiveCamera | OrthographicCamera) {
    if (!this.visible) return;
    if (!this.material.program.created) return;

    gl = GL.get();

    // Update modelMatrix
    this.updateMatrix(camera);

    this.material.program.bind();

    // Culling enable
    if (this.material.culling !== -1) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(this.material.culling);
    }

    this.material.setUniforms(
      camera.projectionMatrix,
      this.modelViewMatrix,
      this.modelMatrix,
      camera
    );

    if (extensions.vertexArrayObject) {
      this.vao.bind();
    } else {
      this.bindAttributes();
      this.bindAttributesInstanced();
      this.bindIndexBuffer();
    }

    if (this.geometry.attributes.aIndex) {
      gl.drawElements(
        this.material.drawType,
        this.geometry.attributes.aIndex.numItems,
        gl.UNSIGNED_SHORT,
        0
      );
    } else {
      gl.drawArrays(
        this.material.drawType,
        0,
        this.geometry.attributes.aVertexPosition.numItems
      );
    }

    if (extensions.vertexArrayObject) {
      this.vao.unbind();
    }

    // Culling disable
    if (this.material.culling !== -1) {
      gl.disable(gl.CULL_FACE);
    }
  }

  public drawInstance(camera: Camera | PerspectiveCamera | OrthographicCamera) {
    if (!this.visible) return;
    if (!this.material.program.created) return;

    gl = GL.get();

    // Update modelMatrix
    this.updateMatrix(camera);

    this.material.program.bind();
    this.material.setUniforms(
      camera.projectionMatrix,
      this.modelViewMatrix,
      this.modelMatrix,
      camera
    );

    // Culling enable
    if (this.material.culling !== -1) {
      gl.enable(gl.CULL_FACE);
      gl.cullFace(this.material.culling);
    }

    // Blending enable
    if (this.material.blending) {
      gl.enable(gl.BLEND);
      gl.blendFunc(this.material.blendFunc[0], this.material.blendFunc[1]);
    }

    if (extensions.vertexArrayObject) {
      this.vao.bind();
    } else {
      this.bindAttributes();
      this.bindAttributesInstanced();
      this.bindIndexBuffer();
    }

    if (gl instanceof WebGL2RenderingContext) {
      gl.drawElementsInstanced(
        this.material.drawType,
        this.geometry.attributes.aIndex.numItems,
        gl.UNSIGNED_SHORT,
        0,
        this.instanceCount
      );
    } else {
      extensions.angleInstancedArrays.drawElementsInstancedANGLE(
        this.material.drawType,
        this.geometry.attributes.aIndex.numItems,
        gl.UNSIGNED_SHORT,
        0,
        this.instanceCount
      );
    }

    if (extensions.vertexArrayObject) {
      this.vao.unbind();
    }

    // Culling disable
    if (this.material.culling !== -1) {
      gl.disable(gl.CULL_FACE);
    }

    // Disable blending
    if (this.material.blending) {
      gl.disable(gl.BLEND);
    }
  }

  public computeBoundingSphere() {
    this.boundingSphere = new Sphere();
    let maxDistance = 0;
    let distance;
    this.geometry.vertices.forEach(vertex => {
      distance = vertex.distance(this.boundingSphere.center);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    this.boundingSphere.radius = maxDistance;
  }

  public dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.vao.dispose();
    this.geometry = null;
    this.material = null;
    super.dispose();
  }
}
