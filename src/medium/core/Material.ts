import { mat3, mat4 } from 'gl-matrix';
import OrthographicCamera from '../cameras/OrthographicCamera';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import Geometry from '../geometry/Geometry';
import Lights from '../lights/Lights';
import Color from '../math/Color';
import {
  basicFragmentShaderEs100,
  basicFragmentShaderEs300
} from '../shaders/Basic.glsl';
import {
  lambertFragmentShaderEs100,
  lambertFragmentShaderEs300
} from '../shaders/Lambert.glsl';
import {
  phongFragmentShaderEs100,
  phongFragmentShaderEs300
} from '../shaders/Phong.glsl';
import { vertexShaderEs100, vertexShaderEs300 } from '../shaders/Vertex.glsl';
import ShaderParser from '../utils/ShaderParser';
import { capabilities } from './Capabilities';
import * as CONSTANTS from './Constants';
import * as GL from './GL';
import Program from './Program';
import UniformBuffers from './UniformBuffers';

let gl: WebGL2RenderingContext | WebGLRenderingContext;
const normalMatrix: mat3 = mat3.create();
const inversedModelViewMatrix: mat4 = mat4.create();

interface Options {
  name?: string;
  type?: string;
  uniforms?: any;
  fov?: number;
  hookVertexPre?: string;
  hookVertexMain?: string;
  hookVertexEnd?: string;
  hookFragmentPre?: string;
  hookFragmentMain?: string;
  hookFragmentEnd?: string;
  vertexShader?: string;
  fragmentShader?: string;
  drawType?: number;
  ambientLight?: Lights;
  directionalLights?: Lights;
  pointLights?: Lights;
  culling?: number;
}

export default class Material {
  public name: string;
  public type: string;
  public uniforms: any;
  public fov: number;
  public hookVertexPre: string;
  public hookVertexMain: string;
  public hookVertexEnd: string;
  public hookFragmentPre: string;
  public hookFragmentMain: string;
  public hookFragmentEnd: string;
  public vertexShader: string;
  public fragmentShader: string;
  public drawType: number;
  public ambientLight: Lights;
  public directionalLights: Lights;
  public pointLights: Lights;
  public culling: number;
  public blending: boolean;
  public blendFunc: number[];
  public program: Program;
  public customUniforms: object;

  constructor(options: Options = {}) {
    const vertexShader = GL.webgl2 ? vertexShaderEs300 : vertexShaderEs100;
    let fragmentShader;

    switch (options.type || '') {
      case CONSTANTS.MATERIAL_LAMBERT: {
        fragmentShader = GL.webgl2
          ? lambertFragmentShaderEs300
          : lambertFragmentShaderEs100;
        break;
      }
      case CONSTANTS.MATERIAL_PHONG: {
        fragmentShader = GL.webgl2
          ? phongFragmentShaderEs300
          : phongFragmentShaderEs100;
        break;
      }
      default: {
        fragmentShader = GL.webgl2
          ? basicFragmentShaderEs300
          : basicFragmentShaderEs100;
      }
    }

    gl = GL.get();

    this.name = '';
    this.type = CONSTANTS.MATERIAL_BASIC;
    this.uniforms = {};
    this.hookVertexPre = '';
    this.hookVertexMain = '';
    this.hookVertexEnd = '';
    this.hookFragmentPre = '';
    this.hookFragmentMain = '';
    this.hookFragmentEnd = '';
    this.vertexShader = vertexShader;
    this.fragmentShader = fragmentShader;
    this.drawType = CONSTANTS.DRAW_TRIANGLES;
    this.directionalLights = undefined;
    this.pointLights = undefined;
    this.culling = CONSTANTS.CULL_NONE;
    this.blending = false;
    this.blendFunc = [gl.SRC_ALPHA, gl.ONE];
    Object.assign(this, options);
    this.program = new Program();
  }

  public create(geometry: Geometry, transformFeedbackVaryings?: string[]) {
    gl = GL.get();

    this.vertexShader = this._processShader(
      this.vertexShader,
      'vertex',
      geometry
    );
    this.fragmentShader = this._processShader(
      this.fragmentShader,
      'fragment',
      geometry
    );

    this.program.link(
      this.vertexShader,
      this.fragmentShader,
      transformFeedbackVaryings
    );

    // User defined uniforms
    this.customUniforms = this.uniforms || {};

    // Uniforms for ProjectionView uniform block
    if (GL.webgl2) {
      this.program.setUniformBlockLocation(
        'ProjectionView',
        UniformBuffers.projectionView.buffer,
        CONSTANTS.UNIFORM_PROJECTION_VIEW_LOCATION
      );
    }

    if (this.ambientLight) {
      if (GL.webgl2) {
        // Setup uniform block for point lights
        this.program.setUniformBlockLocation(
          'AmbientLight',
          this.ambientLight.uniformBuffer.buffer,
          CONSTANTS.UNIFORM_AMBIENT_LIGHT_LOCATION
        );
      } else {
        // Generate uniforms for point lights
        this.ambientLight.get().forEach((ambientLight, i) => {
          Object.keys(ambientLight.uniforms).forEach(ambientLightUniform => {
            const uniform = ambientLight.uniforms[ambientLightUniform];
            this.customUniforms[
              `uAmbientLight.${ambientLightUniform}`
            ] = uniform;
          });
        });
      }
    }

    if (this.directionalLights) {
      if (GL.webgl2) {
        // Setup uniform block for directional lights
        this.program.setUniformBlockLocation(
          'DirectionalLights',
          this.directionalLights.uniformBuffer.buffer,
          CONSTANTS.UNIFORM_DIRECTIONAL_LIGHTS_LOCATION
        );
      } else {
        // Generate uniforms for directional lights
        this.directionalLights.get().forEach((directionalLight, i) => {
          Object.keys(
            directionalLight.uniforms
          ).forEach(directionalLightUniform => {
            const uniform = directionalLight.uniforms[directionalLightUniform];
            this.customUniforms[
              `uDirectionalLights[${i}].${directionalLightUniform}`
            ] = uniform;
          });
        });
      }
    }

    if (this.pointLights) {
      if (GL.webgl2) {
        // Setup uniform block for point lights
        this.program.setUniformBlockLocation(
          'PointLights',
          this.pointLights.uniformBuffer.buffer,
          CONSTANTS.UNIFORM_POINT_LIGHTS_LOCATION
        );
      } else {
        // Generate uniforms for point lights
        this.pointLights.get().forEach((pointLight, i) => {
          Object.keys(pointLight.uniforms).forEach(pointLightUniform => {
            const uniform = pointLight.uniforms[pointLightUniform];
            this.customUniforms[
              `uPointLights[${i}].${pointLightUniform}`
            ] = uniform;
          });
        });
      }
    }

    // Generate texture indices
    const textureIndices = [
      gl.TEXTURE0,
      gl.TEXTURE1,
      gl.TEXTURE2,
      gl.TEXTURE3,
      gl.TEXTURE4,
      gl.TEXTURE5
    ];
    Object.keys(this.uniforms).forEach((uniformName, i) => {
      switch (this.uniforms[uniformName].type) {
        case 't':
        case 'tc':
        case 't3d': {
          this.uniforms[uniformName].textureIndex = i;
          this.uniforms[uniformName].activeTexture = textureIndices[i];
          break;
        }
        default:
      }
    });

    // Add Camera position uniform for point lights if it doesn"t exist
    if (this.uniforms.uCameraPosition === undefined && this.pointLights) {
      this.uniforms.uCameraPosition = {
        type: '3f',
        value: [0, 0, 0]
      };
    }

    // Only for webgl1
    const projectionViewUniforms = GL.webgl2
      ? {}
      : {
          uProjectionMatrix: {
            location: null,
            type: '4fv',
            value: mat4.create()
          }
        };

    // Default uniforms
    this.uniforms = {
      uDiffuse: {
        location: null,
        type: '3f',
        value: new Color().v
      },
      uModelMatrix: {
        location: null,
        type: '4fv',
        value: mat4.create()
      },
      uModelViewMatrix: {
        location: null,
        type: '4fv',
        value: mat4.create()
      },
      uNormalMatrix: {
        location: null,
        type: '4fv',
        value: mat4.create()
      },
      ...this.customUniforms,
      ...projectionViewUniforms
    };

    Object.keys(this.uniforms).forEach(uniformName => {
      this.program.setUniformLocation(this.uniforms, uniformName);
    });
  }

  public _processShader(shader: string, type: string, geometry: Geometry) {
    gl = GL.get();
    let defines = '';

    const precision = `precision ${capabilities.precision} float;`;

    function addDefine(define) {
      defines += `#define ${define} \n`;
    }

    if (geometry.bufferUvs) {
      addDefine('uv');
    }

    if (geometry.bufferColors) {
      addDefine('vertexColors');
    }

    if (geometry.bufferNormals) {
      addDefine('normals');
    }

    if (this.ambientLight) {
      addDefine('ambientLight');
    }

    if (this.directionalLights) {
      addDefine('directionalLights');
    }

    if (this.pointLights) {
      addDefine('pointLights');
    }


    shader = shader.replace(/#HOOK_PRECISION/g, precision);
    shader = shader.replace(/#HOOK_DEFINES/g, defines);
    shader = shader.replace(/#HOOK_VERTEX_PRE/g, this.hookVertexPre);
    shader = shader.replace(/#HOOK_VERTEX_MAIN/g, this.hookVertexMain);
    shader = shader.replace(/#HOOK_VERTEX_END/g, this.hookVertexEnd);
    shader = shader.replace(/#HOOK_FRAGMENT_PRE/g, this.hookFragmentPre);
    shader = shader.replace(/#HOOK_FRAGMENT_MAIN/g, this.hookFragmentMain);
    shader = shader.replace(/#HOOK_FRAGMENT_END/g, this.hookFragmentEnd);

    if (this.pointLights) {
      shader = shader.replace(
        /#HOOK_POINT_LIGHTS/g,
        String(this.pointLights.length)
      );
    }

    if (this.directionalLights) {
      shader = shader.replace(
        /#HOOK_DIRECTIONAL_LIGHTS/g,
        String(this.directionalLights.length)
      );
    }

    return ShaderParser(shader, type);
  }

  public setUniforms(
    projectionMatrix: mat4,
    modelViewMatrix: mat4,
    modelMatrix: mat4,
    camera?: PerspectiveCamera | OrthographicCamera
  ) {
    gl = GL.get();

    // Update the other uniforms
    Object.keys(this.customUniforms).forEach(uniformName => {
      const uniform = this.uniforms[uniformName];
      switch (uniform.type) {
        case 't': {
          gl.uniform1i(uniform.location, uniform.textureIndex);
          gl.activeTexture(uniform.activeTexture);
          gl.bindTexture(gl.TEXTURE_2D, uniform.value);
          break;
        }
        case 'tc': {
          gl.uniform1i(uniform.location, uniform.textureIndex);
          gl.activeTexture(uniform.activeTexture);
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, uniform.value);
          break;
        }
        case 't3d': {
          if (gl instanceof WebGL2RenderingContext) {
            gl.uniform1i(uniform.location, uniform.textureIndex);
            gl.activeTexture(uniform.activeTexture);
            gl.bindTexture(gl.TEXTURE_3D, uniform.value);
          }
          break;
        }
        case 'i': {
          gl.uniform1i(uniform.location, uniform.value);
          break;
        }
        case 'f': {
          gl.uniform1f(uniform.location, uniform.value);
          break;
        }
        case '2f': {
          gl.uniform2f(uniform.location, uniform.value[0], uniform.value[1]);
          break;
        }
        case '3f': {
          gl.uniform3f(
            uniform.location,
            uniform.value[0],
            uniform.value[1],
            uniform.value[2]
          );
          break;
        }
        case '4f': {
          gl.uniform4f(
            uniform.location,
            uniform.value[0],
            uniform.value[1],
            uniform.value[2],
            uniform.value[3]
          );
          break;
        }
        case '1iv': {
          gl.uniform1iv(uniform.location, uniform.value);
          break;
        }
        case '2iv': {
          gl.uniform2iv(uniform.location, uniform.value);
          break;
        }
        case '1fv': {
          gl.uniform1fv(uniform.location, uniform.value);
          break;
        }
        case '2fv': {
          gl.uniform2fv(uniform.location, uniform.value);
          break;
        }
        case '3fv': {
          gl.uniform3fv(uniform.location, uniform.value);
          break;
        }
        case '4fv': {
          gl.uniform4fv(uniform.location, uniform.value);
          break;
        }
        case 'Matrix3fv': {
          gl.uniformMatrix3fv(uniform.location, false, uniform.value);
          break;
        }
        case 'Matrix4fv': {
          gl.uniformMatrix4fv(uniform.location, false, uniform.value);
          break;
        }
        default:
      }
    });

    if (!GL.webgl2) {
      gl.uniformMatrix4fv(
        this.uniforms.uProjectionMatrix.location,
        false,
        projectionMatrix
      );
    }

    gl.uniformMatrix4fv(
      this.uniforms.uModelViewMatrix.location,
      false,
      modelViewMatrix
    );
    gl.uniformMatrix4fv(
      this.uniforms.uModelMatrix.location,
      false,
      modelMatrix
    );

    mat4.identity(inversedModelViewMatrix);
    mat4.invert(inversedModelViewMatrix, modelMatrix);

    mat3.identity(normalMatrix);
    mat3.fromMat4(normalMatrix, inversedModelViewMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(
      this.uniforms.uNormalMatrix.location,
      false,
      normalMatrix
    );

    // uDiffuse
    gl.uniform3f(
      this.uniforms.uDiffuse.location,
      this.uniforms.uDiffuse.value[0],
      this.uniforms.uDiffuse.value[1],
      this.uniforms.uDiffuse.value[2]
    );

    // Camera
    if (camera && this.uniforms.uCameraPosition) {
      gl.uniform3f(
        this.uniforms.uCameraPosition.location,
        camera.position.v[0],
        camera.position.v[1],
        camera.position.v[2]
      );
    }
  }

  public dispose() {
    // Dispose textures
    Object.keys(this.customUniforms).forEach(uniformName => {
      const uniform = this.uniforms[uniformName];
      switch (uniform.type) {
        case 't':
        case 'tc': {
          gl.deleteTexture(uniform.value);
          break;
        }
        default:
      }
    });
    this.program.dispose();
  }
}
