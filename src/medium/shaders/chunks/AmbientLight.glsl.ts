const ambientLightEs300 = `
	uniform AmbientLight {
		vec4 color;
		vec4 intensity;
	} uAmbientLight;
`;

const ambientLightEs100 = `
	struct AmbientLight {
		vec3 color;
		float intensity;
	};
	uniform AmbientLight uAmbientLight;
`;

export { ambientLightEs300, ambientLightEs100 };
