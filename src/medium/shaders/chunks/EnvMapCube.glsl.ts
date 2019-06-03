/**
 * https://github.com/vorg/pragmatic-pbr/blob/master/local_modules/glsl-envmap-cube/index.glsl
 */

export default `
/**
 * Samples cubemap environment map
 * @param  {vec3} wcNormal - normal in the world coordinate space
 * @param  {float} - flipEnvMap    -1.0 for left handed coorinate system oriented texture (usual case)
 *                                  1.0 for right handed coorinate system oriented texture
 * @return {vec4} - cubemap texture coordinate
 */
vec3 envMapCube(vec3 wcNormal, float flipEnvMap) {
	return vec3(flipEnvMap * wcNormal.x, wcNormal.y, wcNormal.z);
}

vec3 envMapCube(vec3 wcNormal) {
 //-1.0 for left handed coorinate system oriented texture (usual case)
 return envMapCube(wcNormal, -1.0);
}
`;
