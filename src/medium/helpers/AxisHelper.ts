import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { capabilities, extensions } from '../core/Capabilities';
import * as GL from '../core/GL';
import Material from '../core/Material';
import Mesh from '../core/Mesh';
import Geometry from '../geometry/Geometry';
import EsVersion from '../shaders/chunks/EsVersion.glsl';
import ProjectionView from '../shaders/chunks/ProjectionView.glsl';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

const vertexShaderEs300 = `${EsVersion}
	layout (location = 0) in vec3 aVertexPosition;
	layout (location = 1) in vec3 aVertexColor;

	${ProjectionView}

	uniform mat4 uModelViewMatrix;

	out vec3 vColor;

	void main(void){
		vColor = aVertexColor;
		gl_Position = uProjectionView.projectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

const vertexShaderEs100 = `
	attribute vec3 aVertexPosition;
	attribute vec3 aVertexColor;

	uniform mat4 uProjectionMatrix;
	uniform mat4 uModelViewMatrix;

	varying vec3 vColor;

	void main(void){
		vColor = aVertexColor;
		gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

function fragmentShaderEs300() {
  return `${EsVersion}
	precision ${capabilities.precision} float;
	in vec3 vColor;
	out vec4 outgoingColor;

	void main(void){
		outgoingColor = vec4(vColor, 1.0);
	}
	`;
}

function fragmentShaderEs100() {
  return `
	precision ${capabilities.precision} float;
	varying vec3 vColor;

	void main(void){
		gl_FragColor = vec4(vColor, 1.0);
	}
	`;
}

class AxisGeometry extends Geometry {
  constructor(size: number) {
    let vertices = [];

    // X
    vertices = vertices.concat([0, 0, 0, size, 0, 0]);
    // Y
    vertices = vertices.concat([0, 0, 0, 0, size, 0]);
    // Z
    vertices = vertices.concat([0, 0, 0, 0, 0, size]);

    // Colors
    const colors = new Float32Array([
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      1
    ]);
    super(new Float32Array(vertices), undefined, undefined, undefined, colors);
  }
}

export default class AxisHelper extends Mesh {
  constructor(size = 1) {
    const vertexShader = GL.webgl2 ? vertexShaderEs300 : vertexShaderEs100;
    const fragmentShader = GL.webgl2
      ? fragmentShaderEs300()
      : fragmentShaderEs100();
    super(
      new AxisGeometry(size),
      new Material({
        name: 'AxisHelper',
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
