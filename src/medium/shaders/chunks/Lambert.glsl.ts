const lambertEs300 = `
	vec3 CalculateDirectionalLight(DirectionalLight light, vec3 normal) {
		vec3 lightDirection = normalize(light.position.xyz);
		// diffuse shading
		float diff = max(dot(lightDirection, normal), 0.0);

		vec3 ambientColor = vec3(0.5);
		float ambientIntensity = 0.5;

		#ifdef ambientLight
		ambientColor = uAmbientLight.color.rgb;
		ambientIntensity = uAmbientLight.intensity.x;
		#endif

		// combine results
		vec3 ambient = (ambientColor * ambientIntensity) * vDiffuse;
		vec3 diffuse = light.color.rgb * diff * vDiffuse;
		return (ambient + diffuse * light.intensity.x);
	}
`;

const lambertEs100 = `
	vec3 CalculateDirectionalLight(DirectionalLight light, vec3 normal) {
		vec3 lightDirection = normalize(light.position);
		// diffuse shading
		float diff = max(dot(lightDirection, normal), 0.0);

			vec3 ambientColor = vec3(0.5);
			float ambientIntensity = 0.5;

			#ifdef ambientLight
			ambientColor = uAmbientLight.color;
			ambientIntensity = uAmbientLight.intensity;
			#endif

			// combine results
		vec3 ambient = (ambientColor * ambientIntensity) * vDiffuse;
			vec3 diffuse = light.color * diff * vDiffuse;
		return (ambient + diffuse * light.intensity);
	}
`;

export { lambertEs300, lambertEs100 };
