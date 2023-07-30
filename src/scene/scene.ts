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
  HavokPlugin,
} from "@babylonjs/core";
import * as CANNON from "cannon";
import HavokPhysics from "@babylonjs/havok";

import Root from "./root";

import { Inspector } from "@babylonjs/inspector";

import Character from "../character/character";
import LocationMeshes from "./locationMeshes";
import * as GUI from "@babylonjs/gui";

export default class MainScene {
  public scene: Scene;
  engine: Engine;
  controller: Character;
  camera: UniversalCamera;
  fps: HTMLElement;
  light: DirectionalLight;
  private location: LocationMeshes;
  private advancedTexture: GUI.AdvancedDynamicTexture;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true, { stencil: true });
    this.scene = this.CreateScene();
    // this.createWorkshopLocation();
    // this.CreateHouseLocation();
    this.location = LocationMeshes.Instance(this.scene);
    this.advancedTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI("main");
    this.createLocation();

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

    return scene;
  }

  async enablePhysic(): Promise<void> {
    const havok = await HavokPhysics();
    this.scene.enablePhysics(
      new Vector3(0, -9.81, 0),
      new HavokPlugin(true, havok)
    );
  }

  private async createLocation(): Promise<void> {
    await this.enablePhysic();
    await this.location.createWorkshopLocation();
    this.controller = new Character(
      this.scene,
      this.engine,
      this.advancedTexture
    );
    this.camera = this.controller.camera;
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
