import * as GL from '../core/GL';
import Vector2 from '../math/Vector2';
import Vector3 from '../math/Vector3';
import { flatten } from '../utils/Array';
import BufferAttribute from './BufferAttribute';
import Face from './Face';

let gl: WebGL2RenderingContext | WebGLRenderingContext;

export default class Geometry {
  public bufferVertices: Float32Array;
  public bufferIndices: Uint16Array;
  public bufferNormals: Float32Array;
  public bufferUvs: Float32Array;
  public bufferColors: Float32Array;
  public attributes: any;
  public attributesInstanced: any;
  public vertices: Vector3[];
  public faces: Face[];
  public uvs: Vector2[];

  constructor(
    vertices: Float32Array,
    indices?: any, // Uint16Array | Uint32Array, (typings are wrong for createBuffer)
    normals?: Float32Array,
    uvs?: Float32Array,
    colors?: Float32Array
  ) {
    gl = GL.get();
    this.bufferVertices = vertices;
    this.bufferIndices = indices;
    this.bufferNormals = normals;
    this.bufferUvs = uvs;
    this.bufferColors = colors;
    this.attributes = {};
    this.attributesInstanced = {};

    // Vertex positions
    if (this.bufferVertices) {
      this.addAttribute(
        'aVertexPosition',
        gl.ARRAY_BUFFER,
        this.bufferVertices,
        3
      );
      this.generateVertices();
    }

    // Vertex indices
    if (this.bufferIndices) {
      this.addAttribute(
        'aIndex',
        gl.ELEMENT_ARRAY_BUFFER,
        this.bufferIndices,
        1,
        false
      );
      this.generateFaces();
    }

    // Vertex normals
    if (this.bufferNormals) {
      this.addAttribute(
        'aVertexNormal',
        gl.ARRAY_BUFFER,
        this.bufferNormals,
        3
      );
    }

    // uvs
    if (this.bufferUvs) {
      this.addAttribute('aUv', gl.ARRAY_BUFFER, this.bufferUvs, 2);
      this.generateUvs();
    }

    // Vertex colors
    if (this.bufferColors) {
      this.addAttribute('aVertexColor', gl.ARRAY_BUFFER, this.bufferColors, 3);
    }
  }

  public addAttribute(
    name: string,
    type: GLenum,
    data: Float32Array | Uint16Array,
    count: number,
    shaderAttribute?: boolean
  ) {
    this.attributes[name] = new BufferAttribute(
      type,
      data,
      count,
      shaderAttribute
    );
  }

  public addInstancedBufferAttribute(name, value, count) {
    this.attributesInstanced[name] = new BufferAttribute(
      gl.ARRAY_BUFFER,
      value,
      count
    );
  }

  public generateVertices() {
    this.vertices = [];
    for (let i = 0; i < this.bufferVertices.length; i += 3) {
      const a = this.bufferVertices[i];
      const b = this.bufferVertices[i + 1];
      const c = this.bufferVertices[i + 2];
      const vertex = new Vector3(a, b, c);
      this.vertices.push(vertex);
    }
  }

  public generateFaces() {
    this.faces = [];
    for (let i = 0; i < this.bufferIndices.length; i += 3) {
      const ia = this.bufferIndices[i];
      const ib = this.bufferIndices[i + 1];
      const ic = this.bufferIndices[i + 2];
      const a = this.vertices[ia];
      const b = this.vertices[ib];
      const c = this.vertices[ic];
      const face = new Face(ia, ib, ic, a, b, c);
      this.faces.push(face);
    }
  }

  public generateUvs() {
    this.uvs = [];
    for (let i = 0; i < this.bufferUvs.length; i += 2) {
      const a = this.bufferUvs[i];
      const b = this.bufferUvs[i + 1];

      const uv = new Vector2(a, b);
      this.uvs.push(uv);
    }
  }

  public updateVertices() {
    gl = GL.get();
    this.vertices.forEach((vertex, i) => {
      this.bufferVertices.set(vertex.v, i * vertex.v.length);
    });
    this.attributes.aVertexPosition.update(this.bufferVertices);
  }

  public updateNormals() {
    const normals = [];
    this.faces.forEach(face => {
      face.updateFaceNormal();
      normals[face.indices[0]] = face.normal.v;
      normals[face.indices[1]] = face.normal.v;
      normals[face.indices[2]] = face.normal.v;
    });
    this.bufferNormals.set(flatten(normals));
    this.attributes.aVertexNormal.update(this.bufferNormals);
  }

  public dispose() {
    gl = GL.get();
    // Dispose attributes and buffers
    Object.keys(this.attributes).forEach(attributeName => {
      this.attributes[attributeName].dispose(gl);
      delete this.attributes[attributeName];
    });
    Object.keys(this.attributesInstanced).forEach(attributeName => {
      this.attributesInstanced[attributeName].dispose(gl);
      delete this.attributesInstanced[attributeName];
    });
    delete this.attributes;
    delete this.attributesInstanced;
    this.bufferVertices = null;
    this.bufferIndices = null;
    this.bufferNormals = null;
    this.bufferUvs = null;
    this.bufferColors = null;
  }
}
