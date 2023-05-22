import {
  Scene,
  Engine,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

import Controller from "./controller";

export default class MainScene {
  scene: Scene;
  engine: Engine;
  controller: Controller;
  camera: UniversalCamera;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();

    this.CreateMeshes();

    this.controller = new Controller(this.scene, this.engine);
    this.camera = this.controller.camera;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const hemiLight = new HemisphericLight(
      "hemiLight",
      new Vector3(0, 1, 0),
      this.scene
    );

    hemiLight.intensity = 0.5;

    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
    scene.collisionsEnabled = true;

    return scene;
  }

  CreateMeshes(): void {
    const ground = MeshBuilder.CreateBox(
      "ground",
      { width: 20, height: 1, depth: 20 },
      this.scene
    );
    const box = MeshBuilder.CreateBox(
      "box",
      { width: 3, height: 3, depth: 3 },
      this.scene
    );
    box.position = new Vector3(0, 2, 7);

    const mat = new StandardMaterial("emissive mat", this.scene);
    mat.emissiveColor = new Color3(0, 1, 0);

    for (let i = 0; i < 4; i++) {
      const cash = MeshBuilder.CreateBox(
        "cash",
        { width: 1, height: 0.2, depth: 0.5 },
        this.scene
      );

      cash.material = mat;
      cash.position = new Vector3(3, 1, i);
    }
    //???
    this.scene.meshes.map((mesh) => {
      mesh.checkCollisions = true;
    });
  }
}
