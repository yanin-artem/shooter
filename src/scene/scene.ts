import {
  Scene,
  Engine,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
  DirectionalLight,
  ShadowGenerator,
} from "@babylonjs/core";

import { Inspector } from "@babylonjs/inspector";

import Character from "../character/character";

export default class MainScene {
  scene: Scene;
  engine: Engine;
  controller: Character;
  camera: UniversalCamera;
  fps: HTMLElement;
  light: DirectionalLight;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();
    this.CreateMeshes();

    this.controller = new Character(this.scene, this.engine);
    this.camera = this.controller.camera;

    this.createInspector();

    this.fps = document.getElementById("fps");

    this.setShadow();

    this.engine.runRenderLoop(() => {
      this.fps.innerHTML = this.engine.getFps().toFixed() + " fps";
      this.scene.render();
    });
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    this.light = new DirectionalLight(
      "directionalLight",
      new Vector3(0.947, -0.319, -0.04),
      this.scene
    );

    this.light.position = new Vector3(-10, -0.319, -0.04);

    this.light.intensity = 0.9;

    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);
    scene.collisionsEnabled = true;

    return scene;
  }

  CreateMeshes(): void {
    const ground = MeshBuilder.CreateBox(
      "ground",
      { width: 40, height: 1, depth: 40 },
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

    const pickableItems = [];
    for (let i = 0; i < 4; i++) {
      const cash = MeshBuilder.CreateBox(
        "cash",
        { width: 1, height: 0.2, depth: 0.5 },
        this.scene
      );

      cash.material = mat;
      cash.position = new Vector3(3, 0.6, i);
      pickableItems.push(cash);
    }
    //???
    this.scene.meshes.map((mesh) => {
      mesh.checkCollisions = true;
      mesh.metadata = { isTool: false };
    });

    pickableItems.map((mesh) => {
      mesh.metadata.isTool = true;
      console.log(mesh);
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

  setShadow(): void {
    this.light.shadowEnabled = true;
    const shadowGenerator = new ShadowGenerator(2048, this.light);

    this.scene.meshes.map((mesh) => {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh);
    });
  }
}
