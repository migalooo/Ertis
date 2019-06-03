// https://raw.githubusercontent.com/stackgl/glsl-gamma/master/out.glsl

export const tonemapReinhard = `
	vec3 tonemapReinhard(vec3 color) {
	  return color / (color + vec3(1.0));
	}
`;
