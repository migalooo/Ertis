import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { capabilities, extensions } from '../core/Capabilities';
import * as GL from '../core/GL';
import Material from '../core/Material';
import Mesh from '../core/Mesh';
import Geometry from '../geometry/Geometry';
import Color from '../math/Color';
import { from3DTo2D } from '../math/Utils';
import EsVersion from '../shaders/chunks/EsVersion.glsl';
import ProjectionView from '../shaders/chunks/ProjectionView.glsl';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

const vertexShaderEs300 = `${EsVersion}
	${ProjectionView}

	in vec3 aVertexPosition;

	uniform mat4 uModelViewMatrix;
	uniform float uSize;

	void main(void){
		vec4 mvPosition = uProjectionView.projectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
		gl_PointSize = uSize * (100.0 / length(mvPosition.xyz));
		gl_Position = mvPosition;
	}
`;

const vertexShaderEs100 = `
	attribute vec3 aVertexPosition;

	uniform mat4 uProjectionMatrix;
	uniform mat4 uModelViewMatrix;
	uniform float uSize;

	void main(void){
		vec4 mvPosition = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
		gl_PointSize = uSize * (100.0 / length(mvPosition.xyz));
		gl_Position = mvPosition;
	}
`;

function fragmentShaderEs300() {
  return `${EsVersion}
	precision ${capabilities.precision} float;
	uniform vec3 uColor;
	out vec4 outgoingColor;

	void main(void){
		if(length(gl_PointCoord - 0.5) > 0.5) {
			discard;
		}
		outgoingColor = vec4(uColor, 1.0);
	}
	`;
}

function fragmentShaderEs100() {
  return `
	precision ${capabilities.precision} float;
	uniform vec3 uColor;

	void main(void){
		if(length(gl_PointCoord - 0.5) > 0.5) {
			discard;
		}
		gl_FragColor = vec4(uColor, 1.0);
	}
	`;
}

class VerticesGeometry extends Geometry {
  constructor(mesh: Mesh, size = 0.5) {
    const vertices = [];

    const length = mesh.geometry.bufferVertices.length;
    for (let i = 0; i < length; i += 1) {
      vertices[i] = mesh.geometry.bufferVertices[i];
    }

    super(new Float32Array(vertices));
  }
}

const projectionViewMatrix = mat4.create();
const modelWorldMatrix = mat4.create();

export default class VerticesHelper extends Mesh {
  public _labels: any[];
  public _parentMesh: Mesh;

  constructor(
    mesh: Mesh,
    size = 1,
    colorPoint = 0x00ff00,
    colorLabel = '#ffffff'
  ) {
    const vertexShader = GL.webgl2 ? vertexShaderEs300 : vertexShaderEs100;
    const fragmentShader = GL.webgl2
      ? fragmentShaderEs300()
      : fragmentShaderEs100();
    super(
      new VerticesGeometry(mesh, size),
      new Material({
        name: 'VerticesHelper',
        vertexShader,
        fragmentShader,
        uniforms: {
          uSize: {
            type: 'f',
            value: size
          },
          uColor: {
            type: '3f',
            value: new Color(colorPoint).v
          }
        }
      })
    );
    this._labels = [];
    this._parentMesh = mesh;
    let element;

    const addLabel = indice => {
      element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.pointerEvents = 'none';
      element.style.color = colorLabel;
      element.style.fontSize = '16px';
      this._labels.push({
        indice,
        element
      });
      document.body.appendChild(element);
    };

    this._parentMesh.geometry.faces.forEach((face, i) => {
      addLabel(face.indices[0]);
      addLabel(face.indices[1]);
      addLabel(face.indices[2]);
    });
  }

  public draw(camera: Camera | PerspectiveCamera | OrthographicCamera) {
    if (!this.visible) return;
    gl = GL.get();

    // Update modelMatrix
    this.updateMatrix(camera);

    // Update
    mat4.identity(projectionViewMatrix);
    mat4.identity(modelWorldMatrix);

    mat4.mul(
      projectionViewMatrix,
      camera.projectionMatrix,
      this.modelViewMatrix
    );

    let screenPosition;
    let vertex;
    this._labels.forEach((label, i) => {
      vertex = this._parentMesh.geometry.vertices[label.indice];
      screenPosition = from3DTo2D(vertex, projectionViewMatrix);
      label.element.style.left = `${screenPosition.x * window.innerWidth}px`;
      label.element.style.top = `${screenPosition.y * window.innerHeight}px`;
      label.element.innerHTML = `${label.indice}`;
    });

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
      gl.POINTS,
      0,
      this.geometry.attributes.aVertexPosition.numItems
    );

    if (extensions.vertexArrayObject) {
      this.vao.unbind();
    }
  }
}
