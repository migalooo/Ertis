export const packNormalToRGB = `
	vec3 packNormalToRGB(const in vec3 normal) {
	  return normalize(normal) * 0.5 + 0.5;
	}
`;

export default {
  packNormalToRGB
};
