import {
  Scene,
  Engine,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
  Mesh,
  TransformNode,
  SceneLoader,
  AbstractMesh,
  Axis,
  Space,
  ActionManager,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import Hands from "./hands";

import playerController from "./PlayerController";

export default class Character {
  public camera: UniversalCamera;
  protected gunSight: Mesh;
  body: AbstractMesh;
  hands: Hands;
  closedHand: AbstractMesh;
  head: Mesh;
  pickArea: Mesh;
  characterOpportunities: playerController;
  newHand: any;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.createController(this.scene, this.engine);
    this.setBody(this.camera, this.scene);
    this.pickArea = this.createPickArea();
    this.head = this.createHead();
    this.hands = new Hands(this.head, this.scene);

    console.log(this.newHand);

    this.characterOpportunities = new playerController(
      this.hands,
      this.body,
      this.scene,
      this.engine,
      this.head,
      this.pickArea
    );
    this.characterOpportunities.setController();
  }

  private createController(scene: Scene, engine: Engine): UniversalCamera {
    const camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0, 0),
      this.scene
    );

    camera.minZ = 0;
    camera.inertia = 0;
    camera.angularSensibility = 600;
    this.scene.activeCameras.push(camera);

    this.gunSight = this.addGunSight(scene);
    return camera;
  }

  private addGunSight(scene: Scene): Mesh {
    if (scene.activeCameras.length === 0) {
      scene.activeCameras.push(scene.activeCamera);
    }

    const GunSightCamera = new UniversalCamera(
      "GunSightCamera",
      new Vector3(0, 0, -50),
      scene
    );
    GunSightCamera.mode = UniversalCamera.ORTHOGRAPHIC_CAMERA;
    GunSightCamera.layerMask = 0x20000000;
    scene.activeCameras.push(GunSightCamera);

    const meshes = [];
    const h = 250;

    const y = MeshBuilder.CreatePlane("y", { size: h * 0.2 }, scene);
    y.scaling = new Vector3(0.05, 1, 1);
    y.position = new Vector3(0, 0, 0);
    meshes.push(y);

    const x = MeshBuilder.CreatePlane("x", { size: h * 0.2 }, scene);
    x.scaling = new Vector3(1, 0.05, 1);
    x.position = new Vector3(0, 0, 0);
    meshes.push(x);

    const gunSight = Mesh.MergeMeshes(meshes);
    gunSight.name = "gunSight";
    gunSight.layerMask = 0x20000000;
    gunSight.freezeWorldMatrix();

    const mat = new StandardMaterial("emissive mat", scene);
    mat.checkReadyOnlyOnce = true;
    mat.emissiveColor = new Color3(0, 1, 0);

    gunSight.material = mat;
    gunSight.isPickable = false;
    gunSight.metadata = { isItem: false };
    scene.activeCamera = GunSightCamera;
    return gunSight;
  }

  private createHead(): Mesh {
    const head = MeshBuilder.CreateSphere("head", {
      diameter: 0.2,
    });
    head.parent = this.body;
    head.position.y = 0.7;
    head.isPickable = false;
    head.metadata = { isItem: false, isConditioner: false };
    this.camera.parent = head;
    return head;
  }

  private createPickArea(): Mesh {
    const sphere = MeshBuilder.CreateSphere("pickArea", { diameter: 3 });
    sphere.metadata = { isItem: false, isConditioner: false };
    this.body.addChild(sphere);
    sphere.position = Vector3.Zero();
    sphere.isVisible = false;
    // sphere.setEnabled(false);
    sphere.isPickable = false;
    return sphere;
  }

  private setBody(camera: UniversalCamera, scene: Scene) {
    const body1 = MeshBuilder.CreateBox("body", {
      height: 1.6,
      width: 0.2,
      depth: 0.05,
    });

    const body2 = MeshBuilder.CreateBox("box", {
      height: 0.1,
      width: 0.5,
      depth: 0.1,
    });

    const InnerMesh = Mesh.MergeMeshes([body1, body2], true);
    InnerMesh.billboardMode = 2;
    InnerMesh.isPickable = false;
    this.body = new AbstractMesh("playerWrapper");
    InnerMesh.parent = this.body;
    this.body.metadata = { isItem: false, isConditioner: false };
    InnerMesh.metadata = { isItem: false, isConditioner: false };
    InnerMesh.position.y = -0.35;
    // InnerMesh.isVisible = false;
    this.body.position.y = 20;
    // this.body.position.z = -7;
  }
}
