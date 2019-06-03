// Contexts
export const WEBGL_CONTEXT: string = 'webgl';
export const WEBGL2_CONTEXT: string = 'webgl2';

// Default ratio
export const RENDERER_DEFAULT_CONTEXT: string = WEBGL2_CONTEXT;
export const RENDERER_DEFAULT_WIDTH: number = 1280;
export const RENDERER_DEFAULT_HEIGHT: number = 720;
export const RENDERER_DEFAULT_RATIO: number =
  RENDERER_DEFAULT_WIDTH / RENDERER_DEFAULT_HEIGHT;

// Precision
export const PRECISION: string = 'highp';

// Culling
export const CULL_NONE: number = -1;
export const CULL_BACK: number = 0x0405;
export const CULL_FRONT: number = 0x0404;
export const CULL_FRONT_AND_BACK: number = 0x0408;

// Draw style
export const DRAW_POINTS: number = 0;
export const DRAW_LINES: number = 1;
export const DRAW_LINE_LOOP: number = 2;
export const DRAW_LINE_STRIP: number = 3;
export const DRAW_TRIANGLES: number = 4;

// Uniform buffer location indices
export const UNIFORM_PROJECTION_VIEW_LOCATION: number = 0;
export const UNIFORM_AMBIENT_LIGHT_LOCATION: number = 1;
export const UNIFORM_DIRECTIONAL_LIGHTS_LOCATION: number = 2;
export const UNIFORM_POINT_LIGHTS_LOCATION: number = 3;

// Material types
export const MATERIAL_BASIC = 'basic';
export const MATERIAL_LAMBERT = 'lambert';
export const MATERIAL_PHONG = 'phong';

export const LIGHT_AMBIENT = 'ambient';
export const LIGHT_DIRECTIONAL = 'directional';
export const LIGHT_POINT = 'point';
