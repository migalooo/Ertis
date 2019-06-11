import {
  GL,
  Renderer,
  Scene,
  PerspectiveCamera,
  GridHelper,
  OrbitControls,
  AxisHelper,
  Geometry,
  MathUtils,
  Mesh,
  Material,
  Constants
} from '../../medium/index';

import * as dat from 'dat.gui'

var gui = new dat.GUI()
function initDat(modes) {
  var options = ['webgl2', 'webgl'];
  function getQuery(query) {
    const match = window.location.search.match(/^\?context\=(.+)\&?/)
    if (match) return match[1]
  }
  var setQuery = function setQuery(query, val) {
    const url = window.location.origin + `?context=${val}`;
    window.location.href = url;
  };
  var guiController = {
    context: getQuery('context') || options[0]
  };
  gui.add(guiController, 'context', options).onChange(function (val) {
    setQuery('context', val);
  });
  return {
    gui: gui,
    guiController: guiController,
    getQuery: getQuery,
    setQuery: setQuery
  };
};

const { guiController } = initDat();



// Renderer
const renderer = new Renderer({
  ratio: window.innerWidth / window.innerHeight,
  prefferedContext: guiController
});
// NOTE: 屏幕像素
renderer.setDevicePixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.canvas);

// Scene
const scene = new Scene();

// Camera
const camera = new PerspectiveCamera({
  fov: 45,
  far: 500
});

camera.position.set(10, 5, 10);
camera.lookAt();

// Helpers
const controls = new OrbitControls(camera, renderer.canvas);

const grid = new GridHelper(10);
scene.add(grid);

const axis = new AxisHelper(1);
scene.add(axis);

// Objects
const TOTAL_POINTS = 600;
const bufferVertices = new Float32Array(TOTAL_POINTS * 3);
const range = 3;

let i3 = 0;
for (let i = 0; i < TOTAL_POINTS; i += 1) {
  i3 = i * 3;
  bufferVertices[i3] = MathUtils.lerp(-range, range, Math.random());
  bufferVertices[i3 + 1] = MathUtils.lerp(-range, range, Math.random());
  bufferVertices[i3 + 2] = MathUtils.lerp(-range, range, Math.random());
}

const geometry = new Geometry(bufferVertices);

const hookVertexEndEs300 = `
	vec4 mvPosition = uProjectionView.projectionMatrix * uModelViewMatrix * vec4(aVertexPosition + transformed, 1.0);
	gl_PointSize = uSize * (100.0 / length(mvPosition.xyz));
	gl_Position = mvPosition;
`;

const hookVertexEndEs100 = `
	vec4 mvPosition = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition + transformed, 1.0);
	gl_PointSize = uSize * (100.0 / length(mvPosition.xyz));
	gl_Position = mvPosition;
`;

const hookFragmentEnd = `
	if(length(gl_PointCoord - 0.5) > 0.5) {
		discard;
	}
	outgoingColor = vec4(1.0);
`;

const shader = new Material({
  hookVertexPre: `
		uniform float uSize;
	`,
  hookVertexEnd: GL.webgl2 ? hookVertexEndEs300 : hookVertexEndEs100,
  hookFragmentEnd,
  uniforms: {
    uSize: {
      type: 'f',
      value: 0.2
    }
  },
  drawType: Constants.DRAW_POINTS
});

const mesh = new Mesh(geometry, shader);
console.log(mesh)

scene.add(mesh);

controls.update();

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
resize();

window.addEventListener('resize', resize);

function update() {
  requestAnimationFrame(update);
  camera.updateMatrixWorld();
  renderer.render(scene, camera);
}
update();

