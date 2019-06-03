import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { capabilities, extensions } from '../core/Capabilities';
import * as GL from '../core/GL';
import Material from '../core/Material';
import Mesh from '../core/Mesh';
import Geometry from '../geometry/Geometry';
import { lerp } from '../math/Utils';
import EsVersion from '../shaders/chunks/EsVersion.glsl';
import ProjectionView from '../shaders/chunks/ProjectionView.glsl';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

const vertexShaderEs300 = `${EsVersion}
	${ProjectionView}

	in vec3 aVertexPosition;

	uniform mat4 uModelViewMatrix;

	void main(void){
		gl_Position = uProjectionView.projectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

const vertexShaderEs100 = `
	attribute vec3 aVertexPosition;

	uniform mat4 uProjectionMatrix;
	uniform mat4 uModelViewMatrix;

	void main(void){
		gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

function fragmentShaderEs300() {
  return `${EsVersion}
	precision ${capabilities.precision} float;
	out vec4 outgoingColor;

	void main(void){
		outgoingColor = vec4(vec3(0.5), 1.0);
	}
	`;
}

function fragmentShaderEs100() {
  return `
	precision ${capabilities.precision} float;

	void main(void){
		gl_FragColor = vec4(vec3(0.5), 1.0);
	}
	`;
}

class GridGeometry extends Geometry {
  constructor(size: number, divisions: number) {
    let vertices = [];
    const halfSize = size * 0.5;

    for (let i = 0; i < divisions + 1; i += 1) {
      const x1 = lerp(-halfSize, halfSize, i / divisions);
      const y1 = 0;
      const z1 = -halfSize;
      const x2 = lerp(-halfSize, halfSize, i / divisions);
      const y2 = 0;
      const z2 = halfSize;
      vertices = vertices.concat([x1, y1, z1, x2, y2, z2]);
    }

    for (let i = 0; i < divisions + 1; i += 1) {
      const x1 = -halfSize;
      const y1 = 0;
      const z1 = lerp(-halfSize, halfSize, i / divisions);
      const x2 = halfSize;
      const y2 = 0;
      const z2 = lerp(-halfSize, halfSize, i / divisions);
      vertices = vertices.concat([x1, y1, z1, x2, y2, z2]);
    }

    super(new Float32Array(vertices));
  }
}

export default class GridHelper extends Mesh {
  constructor(size = 1, divisions = 10) {
    const vertexShader = GL.webgl2 ? vertexShaderEs300 : vertexShaderEs100;
    const fragmentShader = GL.webgl2
      ? fragmentShaderEs300()
      : fragmentShaderEs100();
    super(
      new GridGeometry(size, divisions),
      new Material({
        name: 'GridHelper',
        vertexShader,
        fragmentShader
      })
    );
  }

  public draw(camera: Camera | PerspectiveCamera | OrthographicCamera) {
    if (!this.visible) return;
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

    if (extensions.vertexArrayObject) {
      this.vao.bind();
    } else {
      this.bindAttributes();
      this.bindAttributesInstanced();
      this.bindIndexBuffer();
    }

    gl.drawArrays(
      gl.LINES,
      0,
      this.geometry.attributes.aVertexPosition.numItems
    );

    if (extensions.vertexArrayObject) {
      this.vao.unbind();
    }
  }
}
