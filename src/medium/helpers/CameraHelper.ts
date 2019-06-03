import { mat4 } from 'gl-matrix';
import Camera from '../cameras/Camera';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { capabilities, extensions } from '../core/Capabilities';
import { DRAW_LINE_STRIP } from '../core/Constants';
import * as GL from '../core/GL';
import Material from '../core/Material';
import Mesh from '../core/Mesh';
import Geometry from '../geometry/Geometry';
import EsVersion from '../shaders/chunks/EsVersion.glsl';
import ProjectionView from '../shaders/chunks/ProjectionView.glsl';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

const vertexShaderEs300 = `${EsVersion}
	${ProjectionView}

	in vec3 aVertexPosition;

	uniform mat4 uModelViewMatrix;
	uniform mat3 uNormalMatrix;

	void main(void){
		gl_Position = uProjectionView.projectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

const vertexShaderEs100 = `
	attribute vec3 aVertexPosition;

	uniform mat4 uProjectionMatrix;
	uniform mat4 uModelViewMatrix;
	uniform mat3 uNormalMatrix;

	void main(void){
		gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
	}
`;

function fragmentShaderEs300() {
  return `${EsVersion}
	precision ${capabilities.precision} float;
	out vec4 outgoingColor;

	void main(void){
		outgoingColor = vec4(1.0, 1.0, 0.0, 1.0);
	}
	`;
}

function fragmentShaderEs100() {
  return `
	precision ${capabilities.precision} float;

	void main(void){
		gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
	}
	`;
}

class CameraGeometry extends Geometry {
  constructor(mesh: Mesh, size = 0.5) {
    let vertices = [];

    const addVertex = (x, y, z) => {
      vertices = vertices.concat([x, y, z]);
    };

    function box(z, scale = 1) {
      // bottom left
      addVertex(-1 * scale, -1 * scale, z);

      // top left
      addVertex(-1 * scale, 1 * scale, z);
      addVertex(-1 * scale, 1 * scale, z);

      // top right
      addVertex(1 * scale, 1 * scale, z);
      addVertex(1 * scale, 1 * scale, z);

      // bottom right
      addVertex(1 * scale, -1 * scale, z);
      addVertex(1 * scale, -1 * scale, z);

      // bottom left
      addVertex(-1 * scale, -1 * scale, z);
    }

    const zPosition = 3.5;
    const scaleNear = 0.5;
    const scaleFar = 3;

    // Boxes
    box(0, scaleNear);
    box(zPosition, scaleFar);

    // Lines

    // Bottom left
    addVertex(-1 * scaleNear, -1 * scaleNear, 0);
    addVertex(-1 * scaleFar, -1 * scaleFar, zPosition);

    // Top left
    addVertex(-1 * scaleNear, 1 * scaleNear, 0);
    addVertex(-1 * scaleFar, 1 * scaleFar, zPosition);

    // Top right
    addVertex(1 * scaleNear, 1 * scaleNear, 0);
    addVertex(1 * scaleFar, 1 * scaleFar, zPosition);

    // Bottom right
    addVertex(1 * scaleNear, -1 * scaleNear, 0);
    addVertex(1 * scaleFar, -1 * scaleFar, zPosition);

    super(new Float32Array(vertices));
  }
}

export default class CameraHelper extends Mesh {
  public camera: PerspectiveCamera;
  constructor(camera) {
    const vertexShader = GL.webgl2 ? vertexShaderEs300 : vertexShaderEs100;
    const fragmentShader = GL.webgl2
      ? fragmentShaderEs300()
      : fragmentShaderEs100();
    super(
      new CameraGeometry(camera),
      new Material({
        name: 'CameraHelper',
        vertexShader,
        fragmentShader,
        drawType: DRAW_LINE_STRIP
      })
    );
    this.camera = camera;
  }

  public update() {
    this.position.copy(this.camera.position);
    this.lookAt(this.camera.target);
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
