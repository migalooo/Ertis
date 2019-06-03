/**
 * @author alteredq / http://alteredqualia.com/
 * https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 */

let diff: number;
let newTime: number;
const dateType = window.performance || Date;

export default class Clock {
  public autoStart: boolean;
  public startTime: number;
  public oldTime: number;
  public elapsedTime: number;
  public isRunning: boolean;

  constructor(autoStart = false) {
    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.isRunning = autoStart;
  }

  public start() {
    this.startTime = dateType.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.isRunning = true;
  }

  public stop() {
    this.getElapsedTime();
    this.isRunning = false;
  }

  public getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }

  public getDelta() {
    diff = 0;
    if (this.autoStart && !this.isRunning) {
      this.start();
    }

    if (this.isRunning) {
      newTime = dateType.now();

      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;

      this.elapsedTime += diff;
    }

    return diff;
  }
}
