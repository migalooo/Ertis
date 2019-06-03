declare global {
  interface Window {
    WebGL2RenderingContext: any;
  }
}

// Polyfill
if (window.WebGL2RenderingContext === undefined) {
  window.WebGL2RenderingContext = function WebGL2RenderingContext() {
    return this;
  };
}

// Core
import * as Capabilities from './core/Capabilities';
export { Capabilities };

import * as Constants from './core/Constants';
export { Constants };

import * as GL from './core/GL';
export { GL };

import Mesh from './core/Mesh';
export { Mesh };

import Object3D from './core/Object3D';
export { Object3D };

import Camera from './cameras/Camera';
export { Camera };

import OrthographicCamera from './cameras/OrthographicCamera';
export { OrthographicCamera };

import PerspectiveCamera from './cameras/PerspectiveCamera';
export { PerspectiveCamera };

import RayCaster from './core/Raycaster';
export { RayCaster };

import Renderer from './core/Renderer';
export { Renderer };

import RenderTarget from './core/RenderTarget';
export { RenderTarget };

import Scene from './core/Scene';
export { Scene };

import Material from './core/Material';
export { Material };

import Texture from './core/Texture';
export { Texture };

import Texture3d from './core/Texture3d';
export { Texture3d };

import TextureCube from './core/TextureCube';
export { TextureCube };

import TextureVideo from './core/TextureVideo';
export { TextureVideo };

import UniformBuffer from './core/UniformBuffer';
export { UniformBuffer };

import * as UniformBuffers from './core/UniformBuffers';
export { UniformBuffers };

import Vao from './core/Vao';
export { Vao };

// Geometry
import BoxGeometry from './geometry/BoxGeometry';
export { BoxGeometry };

import BufferAttribute from './geometry/BufferAttribute';
export { BufferAttribute };

import Geometry from './geometry/Geometry';
export { Geometry };

import LineGeometry from './geometry/LineGeometry';
export { LineGeometry };

import PlaneGeometry from './geometry/PlaneGeometry';
export { PlaneGeometry };

import SphereGeometry from './geometry/SphereGeometry';
export { SphereGeometry };

// Helpers
import AxisHelper from './helpers/AxisHelper';
export { AxisHelper };

import CameraHelper from './helpers/CameraHelper';
export { CameraHelper };

import GridHelper from './helpers/GridHelper';
export { GridHelper };

import NormalsHelper from './helpers/NormalsHelper';
export { NormalsHelper };

import VerticesHelper from './helpers/VerticesHelper';
export { VerticesHelper };

// Lights
import Lights from './lights/Lights';
export { Lights };

import AmbientLight from './lights/AmbientLight';
export { AmbientLight };

import DirectionalLight from './lights/DirectionalLight';
export { DirectionalLight };

import PointLight from './lights/PointLight';
export { PointLight };

// Math
import Color from './math/Color';
export { Color };

import Vector3 from './math/Vector3';
export { Vector3 };

import Vector2 from './math/Vector2';
export { Vector2 };

import Ray from './math/Ray';
export { Ray };

import Sphere from './math/Sphere';
export { Sphere };

import * as MathUtils from './math/Utils';
export { MathUtils };

// Shaders
import ShaderChunks from './shaders/chunks/index';
export { ShaderChunks };

// Utils
import * as ArrayUtils from './utils/Array';
export { ArrayUtils };

import CameraDolly from './utils/CameraDolly';
export { CameraDolly };

import Clock from './utils/Clock';
export { Clock };

import Detect from './utils/Detect';
export { Detect };

import ObjParser from './utils/ObjParser';
export { ObjParser };

// Controls
import OrbitControls from './controls/OrbitControls';
export { OrbitControls };

// Loaders
import FileLoader from './loaders/FileLoader';
export { FileLoader };

import HdrLoader from './loaders/HdrLoader';
export { HdrLoader };

import ImageLoader from './loaders/ImageLoader';
export { ImageLoader };

import JsonLoader from './loaders/JsonLoader';
export { JsonLoader };

import ObjLoader from './loaders/ObjLoader';
export { ObjLoader };
