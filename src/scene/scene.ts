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
  CannonJSPlugin,
  PhysicsImpostor,
  SceneLoader,
  Mesh,
  Axis,
  Space,
} from "@babylonjs/core";
import * as CANNON from "cannon";

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

    scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new CannonJSPlugin(true, 10, CANNON)
    );

    return scene;
  }

  async CreateMeshes(): Promise<void> {
    const ground = MeshBuilder.CreateBox(
      "ground",
      { width: 40, height: 1, depth: 40 },
      this.scene
    );

    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0 }
    );

    ground.checkCollisions = true;
    ground.position.y = 3.859;
    ground.isVisible = false;

    const pickableItems = [];

    const homeMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "home.glb"
    );
    const home = homeMeshes.meshes[1];
    home.physicsImpostor = new PhysicsImpostor(
      home,
      PhysicsImpostor.BoxImpostor,
      { mass: 0 }
    );

    home.position.y = home.position.y - home.position.y / 2;
    home.checkCollisions = true;

    const plinthMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "for_konder.glb"
    );
    const plinth = plinthMeshes.meshes;
    plinth[0].position.set(-2.99, 4.48, -6.745);

    plinth.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 0 }
      );
      mesh.checkCollisions = true;
    });

    const conditionerMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "konder.glb"
    );

    const conditioner = conditionerMeshes.meshes;

    conditioner[0].position.set(-2.9, 4.3, -6);
    conditioner[0].rotate(Axis.Y, Math.PI / 2, Space.WORLD);

    conditioner.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 0 }
      );
      mesh.checkCollisions = true;
    });

    const instrumentsBoxMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "box_instrument.glb"
    );

    const instrumentsBox = instrumentsBoxMeshes.meshes;

    instrumentsBox[0].position.set(-5, 4.68, -7);

    instrumentsBox.forEach((mesh) => {
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 0 }
      );
      mesh.checkCollisions = true;
    });

    const pliersMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_01.glb"
    );

    const pliers = pliersMeshes.meshes;

    pliers[0].position.set(-6, 5, -5);

    pliers[0].physicsImpostor = new PhysicsImpostor(
      pliers[0],
      PhysicsImpostor.BoxImpostor,
      { mass: 0.1 }
    );
    pliers[0].checkCollisions = true;

    pickableItems.push(pliers[0]);

    const screwdriverMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_02.glb"
    );

    const screwdriver = screwdriverMeshes.meshes;

    screwdriver[0].position.set(-5, 5, -6);

    screwdriver[0].physicsImpostor = new PhysicsImpostor(
      screwdriver[0],
      PhysicsImpostor.BoxImpostor,
      { mass: 0.1 }
    );
    screwdriver[0].checkCollisions = true;

    pickableItems.push(screwdriver[0]);

    const scissorsMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_03.glb"
    );

    const scissors = scissorsMeshes.meshes;

    scissors[0].position.set(-6, 5, -6);

    scissors[0].physicsImpostor = new PhysicsImpostor(
      scissors[0],
      PhysicsImpostor.BoxImpostor,
      { mass: 0.1 }
    );
    scissors[0].checkCollisions = true;
    console.log(scissors[0]);
    pickableItems.push(scissors[0]);

    // console.log(home);
    this.scene.meshes.map((mesh) => {
      mesh.metadata = { isTool: false };
    });

    pickableItems.map((mesh) => {
      mesh.metadata = { isTool: true };
    });
    // pickableItems.map((mesh) => {
    //   mesh.metadata.isTool = true;
    // });
  }

  createInspector(): void {
    const secondCamera = new UniversalCamera(
      "secondCamera",
      new Vector3(0, 3, 0),
      this.scene
    );
    secondCamera.minZ = 0;

    secondCamera.speed = 0.3;

    secondCamera.keysUp.push(87);
    secondCamera.keysLeft.push(65);
    secondCamera.keysDown.push(83);
    secondCamera.keysRight.push(68);

    this.scene.onKeyboardObservable.add((evt) => {
      if (evt.type === 2 && evt.event.code === "KeyU") {
        secondCamera.attachControl();
        this.camera.detachControl();
        Inspector.Show(this.scene, {});
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
