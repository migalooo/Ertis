import {
  ambientLightEs100,
  ambientLightEs300
} from './chunks/AmbientLight.glsl';
import {
  directionalLightsEs100,
  directionalLightsEs300
} from './chunks/DirectionalLights.glsl';
import EsVersion from './chunks/EsVersion.glsl';
import { lambertEs100, lambertEs300 } from './chunks/Lambert.glsl';

const lambertFragmentShaderEs300 = `${EsVersion}
	#HOOK_PRECISION
	#HOOK_DEFINES

	layout(std140) uniform;

	in vec3 vDiffuse;
	in vec3 vPosition;

	#ifdef normals
	in vec3 vNormal;
	#endif

	#ifdef uv
	in vec2 vUv;
	#endif

	#ifdef ambientLight
	${ambientLightEs300}
	#endif

	#ifdef directionalLights
	${directionalLightsEs300}
	${lambertEs300}
	#endif

	out vec4 outgoingColor;


	#HOOK_FRAGMENT_PRE

	void main(void){

		vec3 color = vec3(0.0);

		#ifdef normals
		vec3 normal = normalize(vNormal);
		#endif

		#HOOK_FRAGMENT_MAIN

		#ifdef directionalLights
		for (int i = 0; i < #HOOK_DIRECTIONAL_LIGHTS; i++) {
			color += CalculateDirectionalLight(uDirectionalLights[i], normal);
		}
		#endif

		outgoingColor = vec4(color.rgb, 1.0);

		#HOOK_FRAGMENT_END
	}
`;

const lambertFragmentShaderEs100 = `
	#HOOK_PRECISION
	#HOOK_DEFINES

	varying vec3 vDiffuse;
	varying vec3 vPosition;

	#ifdef normals
	varying vec3 vNormal;
	#endif

	#ifdef uv
	varying vec2 vUv;
	#endif

	#ifdef ambientLight
	${ambientLightEs100}
	#endif

	#ifdef directionalLights
	${directionalLightsEs100}
	${lambertEs100}
	#endif

	#HOOK_FRAGMENT_PRE

	void main(void){

		vec3 color = vec3(0.0);

		#ifdef normals
		vec3 normal = normalize(vNormal);
		#endif

		#HOOK_FRAGMENT_MAIN

		#ifdef directionalLights
		for (int i = 0; i < #HOOK_DIRECTIONAL_LIGHTS; i++) {
			color += CalculateDirectionalLight(uDirectionalLights[i], normal);
		}
		#endif

		gl_FragColor = vec4(color.rgb, 1.0);

		#HOOK_FRAGMENT_END
	}
`;

export { lambertFragmentShaderEs300, lambertFragmentShaderEs100 };
