import {
  Scene,
  Engine,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
} from '@babylonjs/core';

export default class MainScene {
  scene: Scene;
  engine: Engine;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();

    this.CreateCamera();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const hemiLight = new HemisphericLight(
      'hemiLight',
      new Vector3(0, 1, 0),
      this.scene
    );

    hemiLight.intensity = 0.5;

    return scene;
  }

  CreateCamera(): void {
    const camera = new ArcRotateCamera(
      'camera',
      0,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      this.scene
    );

    camera.attachControl(this.canvas, true);
  }
}
