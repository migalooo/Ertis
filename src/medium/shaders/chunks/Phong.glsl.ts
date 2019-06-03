// https://learnopengl.com/#!Lighting/Multiple-lights

const phongEs300 = `
	vec3 CalculatePointLight(PointLight light, vec3 normal) {
		vec3 lightDirection = normalize(light.position.xyz - vWorldPosition.xyz);

		// diffuse shading
		float diff = max(dot(normal, lightDirection), 0.0);
		// specular shading
		vec3 reflectDirection = reflect(-lightDirection, normal);

		// Fix the spec from showing on the backside by multiplying it by the lambert term
		float spec = diff * pow(max(dot(lightDirection, reflectDirection), 0.0), light.shininess.x);
		// attenuation
		float constant = 1.0;
		float linear = 0.09;
		float quadratic = 0.032;

		float dist = length(light.position.xyz);
		float attenuation = 1.0 / (constant + linear * dist + quadratic * (dist * dist));

		vec3 ambientColor = vec3(0.5);
		float ambientIntensity = 0.5;

		#ifdef ambientLight
		ambientColor = uAmbientLight.color.rgb;
		ambientIntensity = uAmbientLight.intensity.x;
		#endif

		// combine results
		vec3 ambient = (ambientColor * ambientIntensity) * vDiffuse;
		vec3 diffuse = diff * vDiffuse;
		vec3 specular = light.specularColor.rgb * spec * light.shininess.x;
		ambient  *= attenuation;
		diffuse  *= attenuation;
		specular *= attenuation;
		return (ambient + diffuse + specular);
	}
`;

const phongEs100 = `
	vec3 CalculatePointLight(PointLight light, vec3 normal) {
		vec3 lightDirection = normalize(light.position - vWorldPosition.xyz);

		// diffuse shading
		float diff = max(dot(normal, lightDirection), 0.0);
		// specular shading
		vec3 reflectDirection = reflect(-lightDirection, normal);

		// Fix the spec from showing on the backside by multiplying it by the lambert term
		float spec = diff * pow(max(dot(lightDirection, reflectDirection), 0.0), light.shininess);
		// attenuation
		float constant = 1.0;
		float linear = 0.09;
		float quadratic = 0.032;

		float dist = length(light.position);
		float attenuation = 1.0 / (constant + linear * dist + quadratic * (dist * dist));

		vec3 ambientColor = vec3(0.5);
		float ambientIntensity = 0.5;

		#ifdef ambientLight
		ambientColor = uAmbientLight.color;
		ambientIntensity = uAmbientLight.intensity;
		#endif

		// combine results
		vec3 ambient = (ambientColor * ambientIntensity) * vDiffuse;
		vec3 diffuse = diff * vDiffuse;
		vec3 specular = light.specularColor * spec * light.shininess;
		ambient  *= attenuation;
		diffuse  *= attenuation;
		specular *= attenuation;
		return (ambient + diffuse + specular);
	}
`;

export { phongEs300, phongEs100 };
