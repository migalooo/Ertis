import Bezier from 'bezier-js';
import { GUI } from 'dat-gui'
import uuid from 'uuid/v1';
import PerspectiveCamera from '../cameras/PerspectiveCamera';
import { DRAW_LINES } from '../core/Constants';
import EventDispatcher from '../core/EventDispatcher';
import Material from '../core/Material';
import Mesh from '../core/Mesh';
import Scene from '../core/Scene';
import LineGeometry from '../geometry/LineGeometry';
import SphereGeometry from '../geometry/SphereGeometry';

interface DollyCurves {
  origin: Bezier;
  lookat: Bezier;
}

class Dolly {
  public curves: DollyCurves;
  public origin: object[];
  public lookat: object[];
  constructor(origin, lookat, steps = 50) {
    this.origin = origin;
    this.lookat = lookat;
    let originPoints = [];
    let lookatPoints = [];

    origin.forEach(point => {
      originPoints = originPoints.concat(point);
    });

    lookat.forEach(point => {
      lookatPoints = lookatPoints.concat(point);
    });

    this.curves = {
      origin: new Bezier(originPoints),
      lookat: new Bezier(lookatPoints)
    };
  }

  public get(time = 0) {
    const origin = this.curves.origin.get(time);
    const lookat = this.curves.lookat.get(time);
    return {
      origin,
      lookat
    };
  }

  public rebuild() {
    this.curves.origin.update();
    this.curves.lookat.update();
  }

  public destroy() {
    this.curves.origin = null;
    this.curves.lookat = null;
  }
}

interface IDollyHelperLines {
  origin: Mesh;
  lookat: Mesh;
}

interface IDollyHelperPoints {
  origin: Mesh[];
  lookat: Mesh[];
}

class DollyHelper extends EventDispatcher {
  public id: string;
  public dolly: Dolly;
  public scene: Scene;
  public gui: GUI;
  public guiOrigin: GUI;
  public guiLookat: GUI;
  public steps: number;
  public range: number;
  public lines: IDollyHelperLines;
  public points: IDollyHelperPoints;
  constructor(
    dolly: Dolly,
    scene: Scene,
    gui: GUI,
    steps = 50,
    range = 100,
    guiOpen = false,
    guiOpenOrigin = false,
    guiOpenLookat = false
  ) {
    super();
    this.id = uuid();
    this.dolly = dolly;
    this.scene = scene;
    this.gui = gui.addFolder(`Dolly ${this.id}`);
    if (guiOpen) {
      this.gui.open();
    }
    this.steps = steps;
    this.range = range;
    this.lines = {
      origin: null,
      lookat: null
    };
    this.points = {
      origin: [],
      lookat: []
    };
    this.createPoints('origin', this.dolly.origin);
    this.createPoints('lookat', this.dolly.lookat);
    this.createLine('origin', this.dolly.curves.origin.getLUT(this.steps));
    this.createLine('lookat', this.dolly.curves.lookat.getLUT(this.steps));

    // Create gui folders
    this.guiOrigin = this.gui.addFolder(`origin`);
    this.guiLookat = this.gui.addFolder(`lookat`);

    if (guiOpenOrigin) {
      this.guiOrigin.open();
    }

    if (guiOpenLookat) {
      this.guiLookat.open();
    }
    this.guiLookat.open();

    this.dolly.curves.origin.points.forEach((point, i) => {
      const folder = this.guiOrigin.addFolder(`${i}`);
      folder.open();
      folder.add(point, 'x', -this.range, this.range).onChange(this._rebuild);
      folder.add(point, 'y', -this.range, this.range).onChange(this._rebuild);
      folder.add(point, 'z', -this.range, this.range).onChange(this._rebuild);
    });

    this.dolly.curves.lookat.points.forEach((point, i) => {
      const folder = this.guiLookat.addFolder(`${i}`);
      folder.open();
      folder.add(point, 'x', -this.range, this.range).onChange(this._rebuild);
      folder.add(point, 'y', -this.range, this.range).onChange(this._rebuild);
      folder.add(point, 'z', -this.range, this.range).onChange(this._rebuild);
    });
  }

  public _rebuild = () => {
    this.dolly.rebuild();
    this.updateLine('origin', this.dolly.curves.origin.getLUT(this.steps));
    this.updateLine('lookat', this.dolly.curves.lookat.getLUT(this.steps));
    this.updatePoints('origin', this.dolly.curves.origin.points);
    this.updatePoints('lookat', this.dolly.curves.lookat.points);
    this.emit('rebuild');
  };

  public flatten(points) {
    let pointsFlat = [];
    points.forEach(point => {
      pointsFlat = pointsFlat.concat([point.x, point.y, point.z]);
    });
    return pointsFlat;
  }

  public createPoints(id: string, points: object[]) {
    points.forEach((point: any, i) => {
      this.points[id][i] = new Mesh(
        new SphereGeometry(0.2, 4, 5),
        new Material({
          drawType: DRAW_LINES
        })
      );
      this.points[id][i].position.set(point.x, point.y, point.z);
      this.scene.add(this.points[id][i]);
    });
  }

  public updatePoints(id: string, points: object[]) {
    points.forEach((point: any, i) => {
      this.points[id][i].position.set(point.x, point.y, point.z);
    });
  }

  public updateLine(id: string, points: object[]) {
    const length = this.lines[id].geometry.vertices.length / 2;
    let i2 = 0;
    let point0;
    let point1;
    for (let i = 0; i < length; i += 1) {
      i2 = i * 2;
      if (i < length) {
        point0 = points[i];
        point1 = points[i + 1];
        this.lines[id].geometry.vertices[i2].set(point0.x, point0.y, point0.z);
        this.lines[id].geometry.vertices[i2 + 1].set(
          point1.x,
          point1.y,
          point1.z
        );
      }
    }
    this.lines[id].geometry.updateVertices();
  }

  public createLine(id: string, points: object[]) {
    const bufferVertices = new Float32Array(this.flatten(points));
    this.lines[id] = new Mesh(
      new LineGeometry(bufferVertices),
      new Material({
        drawType: DRAW_LINES
      })
    );
    this.scene.add(this.lines[id]);
  }

  public destroy() {
    Object.keys(this.lines).forEach(id => {
      this.scene.remove(this.lines[id], true);
    });
    Object.keys(this.points).forEach(id => {
      this.points[id].forEach(mesh => {
        this.scene.remove(mesh, true);
      });
    });
    this.scene = null;
  }
}

interface CameraDollyOptions {
  camera: PerspectiveCamera;
  scene: Scene;
  gui: GUI;
  curveSteps: number;
  guiSliderRange: number;
  guiOpen: boolean;
  guiOpenOrigin: boolean;
  guiOpenLookat: boolean;
}

export default class CameraDolly {
  public id: string;
  public camera: PerspectiveCamera;
  public scene: Scene;
  public gui: GUI;
  public guiFolder: GUI;
  public curveSteps: number;
  public guiSliderRange: number;
  public guiOpen: boolean;
  public guiOpenOrigin: boolean;
  public guiOpenLookat: boolean;
  public dollies: Dolly[];
  public helpers: DollyHelper[];
  public dolly: string;
  public time: number;

  constructor(options: CameraDollyOptions) {
    this.id = uuid();
    Object.assign(this, options);
    this.dollies = [];
    this.helpers = [];
    this.dolly = '';
    this.time = 0;

    if (this.gui) {
      this.guiFolder = this.gui.addFolder(`Camera Dolly ${this.id}`);
      this.guiFolder.open();
      this.guiFolder.add(this, 'export');
    }
  }

  public add(id, data) {
    this.dollies[id] = new Dolly(data.origin, data.lookat, this.curveSteps);
    this.set(id);
    if (this.guiFolder) {
      this.helpers[id] = new DollyHelper(
        this.dollies[id],
        this.scene,
        this.gui,
        this.curveSteps,
        this.guiSliderRange,
        this.guiOpen,
        this.guiOpenOrigin,
        this.guiOpenLookat
      );
      this.helpers[id].on('rebuild', this.update);
    }
  }

  public export() {
    const data = JSON.stringify(
      {
        origin: this.dollies[this.dolly].curves.origin.points,
        lookat: this.dollies[this.dolly].curves.lookat.points
      },
      undefined,
      2
    );
    window.prompt('Copy to clipboard: Ctrl+C, Enter', data);
  }

  public set(id) {
    this.dolly = id;
  }

  public update = () => {
    const { origin, lookat } = this.dollies[this.dolly].get(this.time);
    this.camera.position.set(origin.x, origin.y, origin.z);
    this.camera.lookAt(lookat.x, lookat.y, lookat.z);
  };

  public destroy() {
    Object.keys(this.dollies).forEach(id => {
      this.dollies[id].destroy();
    });
    Object.keys(this.helpers).forEach(id => {
      this.helpers[id].destroy();
    });
  }
}
