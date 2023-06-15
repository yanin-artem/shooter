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
  CubeTexture,
  Texture,
  HDRCubeTexture,
  AbstractMesh,
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

    this.createSkyBox();

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

    // // scene.useRightHandedSystem = true;
    // const physicsEngine = scene.getPhysicsEngine();
    // physicsEngine.setSubTimeStep(100);
    return scene;
  }

  async CreateMeshes(): Promise<void> {
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 40, height: 40 },
      this.scene
    );

    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0 }
    );

    ground.checkCollisions = true;
    ground.position.y = 4.359;
    ground.isVisible = false;

    const pickableItems = [];

    const homeMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "home.glb"
    );
    const home = homeMeshes.meshes[1];
    // home.physicsImpostor = new PhysicsImpostor(
    //   home,
    //   PhysicsImpostor.BoxImpostor,
    //   { mass: 0 }
    // );

    home.position.y = home.position.y - home.position.y / 2;
    // home.checkCollisions = true;

    const homeBox = MeshBuilder.CreateBox("homeBox", {
      width: 5,
      height: 5,
      depth: 5,
    });
    homeBox.position.set(-0.001, 6.513, -5.405);
    homeBox.scaling.set(0.838, 0.864, 1.235);

    homeBox.physicsImpostor = new PhysicsImpostor(
      homeBox,
      PhysicsImpostor.BoxImpostor,
      { mass: 0 }
    );
    homeBox.checkCollisions = true;
    homeBox.isVisible = false;

    const rightHomeCollumn = MeshBuilder.CreateBox("rightHomeCollumn", {
      width: 0.5,
      height: 5,
      depth: 1,
    });
    rightHomeCollumn.position.set(2.412, 6.837, -3.044);
    rightHomeCollumn.scaling.set(1.201, 0.992, 1.504);
    rightHomeCollumn.isVisible = false;
    rightHomeCollumn.checkCollisions = true;

    const leftHomeCollumn = rightHomeCollumn.clone("leftHomeCollumn");

    leftHomeCollumn.physicsImpostor = new PhysicsImpostor(
      leftHomeCollumn,
      PhysicsImpostor.BoxImpostor,
      { mass: 0 }
    );
    leftHomeCollumn.position.x = -2.413;

    const invisibleBackwardWall = MeshBuilder.CreateBox(
      "invisibleBackwardWall",
      {
        width: 25,
        height: 5,
        depth: 0.5,
      }
    );

    invisibleBackwardWall.position.set(0, 6.701, -8.756);
    invisibleBackwardWall.isVisible = false;
    invisibleBackwardWall.checkCollisions = true;

    const invisibleLeftWall1 = MeshBuilder.CreateBox("invisibleLeftWall1", {
      width: 0.5,
      height: 5,
      depth: 15,
    });
    invisibleLeftWall1.position.set(11.417, 6.701, -1.098);
    invisibleLeftWall1.checkCollisions = true;
    invisibleLeftWall1.isVisible = false;

    const invisibleLeftWall2 = MeshBuilder.CreateBox("invisibleLeftWall2", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall2.position.set(11.03, 6.701, 2.554);
    invisibleLeftWall2.rotation.set(0, -Math.PI / 11.36, 0);
    invisibleLeftWall2.checkCollisions = true;
    invisibleLeftWall2.isVisible = false;

    const invisibleLeftWall3 = MeshBuilder.CreateBox("invisibleLeftWall3", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall3.position.set(9.611, 6.701, 5.068);
    invisibleLeftWall3.rotation.set(0, -Math.PI / 4.376, 0);
    invisibleLeftWall3.checkCollisions = true;
    invisibleLeftWall3.isVisible = false;

    const invisibleLeftWall4 = MeshBuilder.CreateBox("invisibleLeftWall4", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall4.position.set(6.393, 6.701, 7.465);
    invisibleLeftWall4.rotation.set(0, -Math.PI / 2.7547, 0);
    invisibleLeftWall4.checkCollisions = true;
    invisibleLeftWall4.isVisible = false;

    const invisibleRightWall1 = invisibleLeftWall1.clone("invisibleRightWall1");
    invisibleRightWall1.position.x = -11.425;

    const invisibleRightWall2 = invisibleLeftWall2.clone("invisibleRightWall2");
    invisibleRightWall2.position.set(-10.451, 6.701, 3.778);
    invisibleRightWall2.rotation.set(0, Math.PI / 6.52, 0);

    const invisibleRightWall3 = invisibleLeftWall3.clone("invisibleRightWall3");
    invisibleRightWall3.position.set(-7.828, 6.701, 6.78);
    invisibleRightWall3.rotation.set(0, Math.PI / 3.265, 0);

    const invisibleForwardWall = MeshBuilder.CreateBox("invisibleForwardWall", {
      width: 15,
      height: 5,
      depth: 0.5,
    });

    invisibleForwardWall.position.set(0, 6.701, 8.861);
    invisibleForwardWall.checkCollisions = true;
    invisibleForwardWall.isVisible = false;

    const roofElem1 = MeshBuilder.CreateBox("roofElem1", {
      width: 0.5,
      height: 2,
      depth: 1,
    });
    roofElem1.position.set(-9.98, 5.131, -1.594);
    roofElem1.scaling.set(1.201, 0.992, 1.504);
    roofElem1.isVisible = false;
    roofElem1.checkCollisions = true;

    const roofElem2 = roofElem1.clone("roofElem2");
    roofElem2.position.z = -4.391;
    roofElem2.isVisible = false;
    roofElem2.checkCollisions = true;

    const roofElem3 = roofElem1.clone("roofElem3");
    roofElem3.position.x = 10.013;
    roofElem3.isVisible = false;
    roofElem3.checkCollisions = true;

    const roofElem4 = roofElem3.clone("roofElem4");
    (roofElem4.position.z = -4), 391;
    roofElem4.isVisible = false;
    roofElem4.checkCollisions = true;

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
      // console.log(mesh)
    });

    const instrumentsBoxMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "box_instrument.glb"
    );

    const instrumentsBox = instrumentsBoxMeshes.meshes;
    instrumentsBox[0].setParent(null);
    instrumentsBox[0].position.set(-5, 4.68, -7);
    instrumentsBox[0].physicsImpostor = new PhysicsImpostor(
      instrumentsBox[0],
      PhysicsImpostor.BoxImpostor,
      { mass: 0 }
    );

    const pliersMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_01.glb"
    );

    const pliers = pliersMeshes.meshes;
    pliers[1].position.set(0, 0, 0);

    pliers[1].setParent(null);
    pliers[1].position.set(-6, 5, -5);
    const pliersHitbox = pliers[1].clone("pliersHitbox", pliers[1]);
    pliersHitbox.position = Vector3.Zero();
    pliersHitbox.scaling.scaleInPlace(2);
    pliersHitbox.rotation = pliers[1].rotation;
    pliersHitbox.isVisible = false;

    pliers[1].physicsImpostor = new PhysicsImpostor(
      pliers[1],
      PhysicsImpostor.MeshImpostor,
      { mass: 0.1 }
    );
    pickableItems.push(pliers);

    const screwdriverMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_02.glb"
    );

    const screwdriver = screwdriverMeshes.meshes;

    screwdriver[1].position.set(0, 0, 0);

    screwdriver[1].setParent(null);
    screwdriver[1].position.set(-5, 5, -6);
    const screwdriverHitbox = screwdriver[1].clone(
      "screwdriverHitbox",
      screwdriver[1]
    );
    screwdriverHitbox.position = Vector3.Zero();
    screwdriverHitbox.scaling.scaleInPlace(2);
    screwdriverHitbox.isVisible = false;

    screwdriver[1].physicsImpostor = new PhysicsImpostor(
      screwdriver[1],
      PhysicsImpostor.MeshImpostor,
      { mass: 0.01 }
    );

    pickableItems.push(screwdriver);

    const scissorsMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_03.glb"
    );

    const scissors = scissorsMeshes.meshes;

    scissors[1].position.set(0, 0, 0);
    scissors[1].setParent(null);
    scissors[1].position.set(-6, 5, -6);
    const scissorsHitbox = scissors[1].clone("scissorsHitbox", scissors[1]);
    scissorsHitbox.position = Vector3.Zero();
    scissorsHitbox.scaling.scaleInPlace(2);
    scissorsHitbox.rotation = scissors[1].rotation;
    scissorsHitbox.isVisible = false;
    scissors[1].physicsImpostor = new PhysicsImpostor(
      scissors[1],
      PhysicsImpostor.MeshImpostor,
      { mass: 0.1 }
    );
    pickableItems.push(scissors);

    this.scene.meshes.map((mesh) => {
      mesh.metadata = { isTool: false, isConditioner: false };
    });

    pickableItems.map((mesh, index) => {
      mesh[1].metadata.isTool = true;
      mesh[1].metadata.toolIndex = index;
      mesh[1].getChildMeshes()[0].metadata.isTool = true;
      mesh[1].getChildMeshes()[0].metadata.toolIndex = index;
    });

    conditioner.map((mesh) => {
      mesh.metadata.isConditioner = true;
      mesh.name === "Корпус"
        ? (mesh.metadata.isDetail = false)
        : (mesh.metadata.isDetail = true);
    });

    this.setShadow();
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
      } else if (evt.type === 2 && evt.event.code === "KeyO") {
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
    shadowGenerator.useBlurCloseExponentialShadowMap = true;
    this.light.shadowMaxZ = 10;
    this.light.shadowMinZ = 1;
    this.scene.meshes.map((mesh) => {
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh);
    });
  }

  createSkyBox(): void {
    const skyboxMaterial = new HDRCubeTexture(
      "../assets/skyboxes/sunset_jhbcentral_4k.hdr",
      this.scene,
      1000
    );

    // this.scene.environmentTexture = skyboxMaterial;
    this.scene.createDefaultSkybox(skyboxMaterial, true);
  }
}
