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
  VideoTexture,
  AmmoJSPlugin,
  ActionManager,
} from "@babylonjs/core";
// import Ammo from "ammojs-typed";
import * as CANNON from "cannon";

import Root from "./root";

import { Inspector } from "@babylonjs/inspector";

import Character from "../character/character";

export default class MainScene {
  public scene: Scene;
  engine: Engine;
  controller: Character;
  camera: UniversalCamera;
  fps: HTMLElement;
  light: DirectionalLight;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();
    this.createWorkshopLocation();
    // this.CreateHouseLocation();

    this.createInspector();

    this.fps = document.getElementById("fps");

    this.createSkyBox();
    this.createVideoMonitor();
    new Root(this.scene, this.engine);
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

    // // scene.useRightHandedSystem = true;
    // const physicsEngine = scene.getPhysicsEngine();
    // physicsEngine.setSubTimeStep(100);
    return scene;
  }

  async enablePhysic(): Promise<void> {
    // const ammo = await Ammo();
    this.scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new CannonJSPlugin(true, 10, CANNON)
    );
  }

  async createWorkshopLocation(): Promise<void> {
    this.enablePhysic();

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
    ground.position.y = -0.024;
    ground.isVisible = false;

    const workshop = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "workshop.glb"
    );
    workshop.meshes.forEach((mesh) => (mesh.checkCollisions = true));

    this.scene.meshes.map((mesh) => {
      mesh.metadata = { isItem: false, isConditioner: false };
    });

    // conditioner.map((mesh) => {
    //   mesh.metadata.isConditioner = true;
    //   mesh.name === "Корпус"
    //     ? (mesh.metadata.isDetail = false)
    //     : (mesh.metadata.isDetail = true);
    // });
    this.setShadow();

    this.controller = new Character(this.scene, this.engine);
    this.camera = this.controller.camera;
  }

  async CreateHouseLocation(): Promise<void> {
    this.enablePhysic();

    // const ground = MeshBuilder.CreateBox(
    //   "ground",
    //   { width: 40, height: 1, depth: 40 },
    //   this.scene
    // );

    // ground.physicsImpostor = new PhysicsImpostor(
    //   ground,
    //   PhysicsImpostor.BoxImpostor,
    //   { mass: 0 }
    // );

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

    const homeMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/house/",
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
      "../assets/models/house/",
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
      "../assets/models/house/",
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
      "../assets/models/house/",
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

    this.controller = new Character(this.scene, this.engine);
    this.camera = this.controller.camera;
    console.log(this.scene);
    this.scene.meshes.map((mesh) => {
      mesh.metadata = { isItem: false, isConditioner: false };
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

  private createVideoMonitor(): void {
    const planeOpts = {
      height: 1.835,
      width: 2.93,
      sideOrientation: Mesh.DOUBLESIDE,
    };
    const ANote0Video = MeshBuilder.CreatePlane("plane", planeOpts, this.scene);
    ANote0Video.rotation = new Vector3(0, Math.PI / 2, 0);
    const vidPos = new Vector3(12.27, 1.815, 1.631);
    ANote0Video.position = vidPos;
    const ANote0VideoMat = new StandardMaterial("m", this.scene);
    const ANote0VideoVidTex = new VideoTexture(
      "vidtex",
      "../assets/videos/Rick Astley - Never Gonna Give You Up (Official Music Video).mp4",
      this.scene
    );
    ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
    ANote0VideoMat.roughness = 1;
    ANote0VideoMat.emissiveColor = Color3.White();
    ANote0Video.material = ANote0VideoMat;
    ANote0VideoVidTex.video.autoplay = true;
    ANote0VideoVidTex.video.muted = true;
    ANote0VideoVidTex.video.play();
  }
}
