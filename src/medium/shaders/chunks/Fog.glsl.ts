// https://github.com/hughsk/glsl-fog

export const linear = `
float fogLinear(const float dist, const float start, const float end) {
  return 1.0 - clamp((end - dist) / (end - start), 0.0, 1.0);
}
`;

export const exp = `
float fogExp(
  const float dist,
  const float density
) {
  return 1.0 - clamp(exp(-density * dist), 0.0, 1.0);
}
`;

export const exp2 = `
float fogExp2(
  const float dist,
  const float density
) {
  const float LOG2 = -1.442695;
  float d = density * dist;
  return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}
`;

export default {
  linear,
  exp,
  exp2
};
