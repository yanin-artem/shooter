import {
  Scene,
  Engine,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
  Mesh,
  Space,
  Ray,
} from "@babylonjs/core";

import Controller from "./controller";

export default class MainScene {
  scene: Scene;
  engine: Engine;
  controller: Controller;
  camera: UniversalCamera;
  body: Mesh;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();

    this.CreateMeshes();

    this.controller = new Controller(this.scene, this.engine);
    this.camera = this.controller.camera;
    this.body = this.controller.body;

    this.engine.runRenderLoop(() => {
      // this.body.position.x = this.camera.position.x + 1;
      // this.body.position.y = this.camera.position.y + 1;
      // this.body.position.z = this.camera.position.z + 1;
      this.body.position = this.camera.position;
      this.body.rotation.y = this.camera.rotation.y;
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
      cash.position = new Vector3(3, 0.6, i);
    }
    //???
    this.scene.meshes.map((mesh) => {
      mesh.checkCollisions = true;
    });
  }
}
