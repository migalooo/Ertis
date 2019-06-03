const directionalLightsEs300 = `
	struct DirectionalLight {
		vec4 position;
		vec4 color;
		vec4 intensity;
	};
	uniform DirectionalLights {
		DirectionalLight uDirectionalLights[#HOOK_DIRECTIONAL_LIGHTS];
	};
`;

const directionalLightsEs100 = `
	struct DirectionalLight {
		vec3 position;
		vec3 color;
		float intensity;
	};
	uniform DirectionalLight uDirectionalLights[#HOOK_DIRECTIONAL_LIGHTS];
`;

export { directionalLightsEs300, directionalLightsEs100 };
