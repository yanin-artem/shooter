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
} from "@babylonjs/core";
import "@babylonjs/loaders";
import playerController from "./PlayerController";

export default class Character {
  camera: UniversalCamera;
  protected gunSight: Mesh;
  body: AbstractMesh;
  hand: TransformNode;
  head: Mesh;
  characterOpportunities: playerController;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.createController(this.scene, this.engine);
    this.createHand(this.camera);
    this.setBody(this.camera, this.scene);
    this.head = this.createHead();

    this.characterOpportunities = new playerController(
      this.camera,
      this.hand,
      this.body,
      this.scene,
      this.engine,
      this.head
    );
    this.characterOpportunities.setController();
  }

  private createController(scene: Scene, engine: Engine): UniversalCamera {
    const camera = new UniversalCamera(
      "camera",
      new Vector3(0, 0.85, 0),
      this.scene
    );

    scene.onPointerDown = () => {
      if (!engine.isPointerLock) engine.enterPointerlock();
    };

    camera.minZ = 0;
    camera.inertia = 0;
    camera.angularSensibility = 600;

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
    gunSight.metadata = { isTool: false };

    return gunSight;
  }

  private async createHand(camera: UniversalCamera): Promise<void> {
    this.hand = new TransformNode("hand");
    this.hand.position.x = camera.position.x + 0.2;
    this.hand.position.y -= 0.15;
    this.hand.parent = camera;
    this.hand.position.z = camera.position.z + 0.2;

    this.hand.rotation = new Vector3(-1, 2.5, 0);

    const { meshes } = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "handbynadevaynoskix.obj"
    );

    meshes.forEach((mesh) => {
      mesh.scaling = new Vector3(0.02, 0.02, 0.02);
      mesh.parent = this.hand;
      mesh.isPickable = false;
      mesh.metadata = { isTool: false };
    });
  }

  private createHead(): Mesh {
    const head = MeshBuilder.CreateSphere("head", { diameter: 0.4 });
    head.parent = this.body;
    head.position.y = 1;
    head.isPickable = false;
    this.camera.parent = head;
    return head;
  }

  private setBody(camera: UniversalCamera, scene: Scene) {
    // this.body = MeshBuilder.CreateCapsule("body", {
    //   height: 1.7,
    //   radius: 0.3,
    // });

    const body1 = MeshBuilder.CreateCapsule("body", {
      height: 1.7,
      radius: 0.3,
    });

    const body2 = MeshBuilder.CreateBox("box", {
      height: 0.1,
      width: 1,
      depth: 0.1,
    });

    const InnerMesh = Mesh.MergeMeshes([body1, body2], true);
    InnerMesh.billboardMode = 2;
    InnerMesh.isPickable = false;
    this.body = new AbstractMesh("playerWrapper");
    InnerMesh.parent = this.body;
    this.body.metadata = { isTool: false };
    InnerMesh.metadata = { isTool: false };
    // this.camera.parent = this.body;

    // this.body.scaling = body.scaling;
    // body.position = this.body.position;
    this.body.position.y = 10;
  }
}
