import { WEBGL2_CONTEXT } from './Constants';
import { warn } from '../utils/Console';

let gl: WebGL2RenderingContext | WebGLRenderingContext;
let contextType: string;
let webgl2: boolean;

/*
	Set the gl instance
	This is set from the renderer
*/
export function set(
  _gl: WebGL2RenderingContext | WebGLRenderingContext,
  _contextType: string
) {
  gl = _gl;
  contextType = _contextType;
  webgl2 = contextType === WEBGL2_CONTEXT;
}

/*
	Get the gl instance
*/
export function get(): WebGL2RenderingContext | WebGLRenderingContext {
  return gl;
}

/**
	* createBuffer
	* @return {Buffer}
	*/
function createBuffer(
  type: GLenum,
  data: Float32Array | Uint16Array,
  isDynamic: boolean = false
) {
  const buffer = gl.createBuffer();
  const usage = isDynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
  const ArrayView = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
  gl.bindBuffer(type, buffer);
  // https://github.com/nkemnitz/webgl2-ts/blob/master/WebGL2/webgl2-context.d.ts#L276
  if (gl instanceof WebGL2RenderingContext) {
    gl.bufferData(type, new ArrayView(data), usage, 0);
  } else {
    gl.bufferData(type, new ArrayView(data), usage);
  }
  gl.bindBuffer(type, null);
  return buffer;
}

/**
	* createUniformBuffer
	* @return {Buffer}
	*/
function createUniformBuffer(data: Float32Array) {
  if (gl instanceof WebGL2RenderingContext) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(data), gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    return buffer;
  } else {
    // NOTE: 
    // 非webgl2 返回FALSE  gl.UNIFORM_BUFFER 为webgl2
    warn( 'UniformBuffer only support in WebGL2RenderingContext.');
  } 
}

export { webgl2, createBuffer, createUniformBuffer };
