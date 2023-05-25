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

import { Inspector } from "@babylonjs/inspector";

// ... YOUR SCENE CREATION

import Character from "../character/character";

export default class MainScene {
  scene: Scene;
  engine: Engine;
  controller: Character;
  camera: UniversalCamera;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();

    this.CreateMeshes();

    this.controller = new Character(this.scene, this.engine);
    this.camera = this.controller.camera;

    this.createInspector();

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
      cash.position = new Vector3(3, 0.6, i);
    }
    //???
    this.scene.meshes.map((mesh) => {
      mesh.checkCollisions = true;
    });
  }

  createInspector(): void {
    const secondCamera = new UniversalCamera(
      "secondCamera",
      new Vector3(0, 3, 0),
      this.scene
    );

    secondCamera.speed = 1;

    secondCamera.keysUp.push(87);
    secondCamera.keysLeft.push(65);
    secondCamera.keysDown.push(83);
    secondCamera.keysRight.push(68);

    this.scene.onKeyboardObservable.add((evt) => {
      if (evt.type === 2 && evt.event.code === "KeyU") {
        secondCamera.attachControl();
        this.camera.detachControl();
        Inspector.Show(this.scene, { embedMode: true });
        this.engine.exitPointerlock;
        this.scene.activeCameras = [];
        this.scene.activeCameras.push(secondCamera);
      } else if (evt.type === 2 && evt.event.code === "KeyI") {
        if (!this.engine.isPointerLock) this.engine.enterPointerlock();
        secondCamera.detachControl();
        this.camera.attachControl();
        Inspector.Hide();
        this.scene.activeCameras = [];
        this.scene.activeCameras.push(this.camera);
      }
    });
  }
}
