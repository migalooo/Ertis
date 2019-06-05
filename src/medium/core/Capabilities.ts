import { warn } from '../utils/Console';
import { PRECISION } from './Constants';
import * as GL from './GL';

/*
	* https://github.com/mrdoob/three.js/blob/dev/src/renderers/webgl/WebGLCapabilities.js
	*/
function getMaxPrecision(
  gl: WebGL2RenderingContext | WebGLRenderingContext,
  precision: string
) {
  switch(precision) {
    case 'highp':
    if (
      gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 &&
      gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0
    ) {
      return 'highp';
    }
    case 'mediump':
    if (
      gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 &&
      gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT) .precision > 0
    ) {
      return 'mediump';
    }
    default:
      return 'lowp';
  }
}

function Capabilities(gl: WebGL2RenderingContext | WebGLRenderingContext) {
  let precision = PRECISION;
  const maxPrecision = getMaxPrecision(gl, precision);

  if (maxPrecision !== precision) {
    warn(
      'Capabilities:',
      precision,
      'not supported, using',
      maxPrecision,
      'instead.'
    );
    precision = maxPrecision;
  }

  const maxTextures: number = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  const maxVertexTextures: number = gl.getParameter( gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
  const maxTextureSize: number = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxCubemapSize: number = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

  const maxAttributes: number = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
  const maxVertexUniforms: number = gl.getParameter( gl.MAX_VERTEX_UNIFORM_VECTORS);
  const maxVaryings: number = gl.getParameter(gl.MAX_VARYING_VECTORS);
  const maxFragmentUniforms: number = gl.getParameter( gl.MAX_FRAGMENT_UNIFORM_VECTORS);

  return {
    maxAttributes,
    maxCubemapSize,
    maxFragmentUniforms,
    maxPrecision,
    maxTextures,
    maxTextureSize,
    maxVertexTextures,
    maxVertexUniforms,
    maxVaryings,
    precision
  };
}

function Extensions(gl: WebGL2RenderingContext | WebGLRenderingContext) {
  const vertexArrayObject = GL.webgl2 || gl.getExtension('OES_vertex_array_object') || false;
  const angleInstancedArrays = gl.getExtension('ANGLE_instanced_arrays') || false;
  const textureFloat = gl.getExtension('OES_texture_float') || false;

  return {
    angleInstancedArrays,
    textureFloat,
    vertexArrayObject
  };
}

let capabilities: any = {};
let extensions: any = {};

/*
	Set the capabilities once
*/
export function set(gl: WebGL2RenderingContext | WebGLRenderingContext) {
  capabilities = Capabilities(gl);
  extensions = Extensions(gl);
}

/*
	Get capabilities
*/
export { capabilities, extensions };
