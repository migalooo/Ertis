const pointLightsEs300 = `
	struct PointLight {
		vec4 position;
		vec4 color;
		vec4 specularColor;
		vec4 shininess;
		vec4 intensity;
	};
	uniform PointLights {
		PointLight uPointLights[#HOOK_POINT_LIGHTS];
	};
`;

const pointLightsEs100 = `
	struct PointLight {
		vec3 position;
		vec3 color;
		vec3 specularColor;
		float shininess;
		float intensity;
	};
	uniform PointLight uPointLights[#HOOK_POINT_LIGHTS];
`;

export { pointLightsEs300, pointLightsEs100 };
