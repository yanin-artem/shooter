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
} from "@babylonjs/core";
import "@babylonjs/loaders";
import playerController from "./PlayerController";

export default class Character {
  camera: UniversalCamera;
  protected gunSight: Mesh;
  body: AbstractMesh;
  hand: AbstractMesh;
  head: Mesh;
  characterOpportunities: playerController;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.createController(this.scene, this.engine);
    this.setBody(this.camera, this.scene);
    this.head = this.createHead();
    this.hand = this.createHand();
    console.log(this.hand);

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
      new Vector3(0, 0, 0),
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

  private createHand(): AbstractMesh {
    let hand = new AbstractMesh("hand");
    SceneLoader.ImportMeshAsync("", "../assets/models/", "arm.glb").then(
      (meshes) => {
        const importMeshes = meshes;
        hand = meshes.meshes[1];
        console.log(meshes.meshes[1]);
        meshes.meshes.map((mesh) => {
          mesh.metadata = { isTool: false };
          mesh.isPickable = false;
        });
        hand.position.set(0.15, -0.139, 0.358);
        hand.rotate(Axis.X, -Math.PI / 7.8, Space.WORLD);
        hand.rotate(Axis.Y, Math.PI / 2.16, Space.WORLD);

        hand.parent = this.head;

        hand.scaling.z = -1;
      }
    );
    console.log(hand);
    return hand;
  }

  private createHead(): Mesh {
    const head = MeshBuilder.CreateSphere("head", { diameter: 0.2 });
    head.parent = this.body;
    head.position.y = 0.4;
    head.isPickable = false;
    head.metadata = { isTool: false };
    this.camera.parent = head;
    return head;
  }

  private setBody(camera: UniversalCamera, scene: Scene) {
    // this.body = MeshBuilder.CreateCapsule("body", {
    //   height: 1.7,
    //   radius: 0.3,
    // });

    const body1 = MeshBuilder.CreateCapsule("body", {
      height: 1.3,
      radius: 0.2,
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
    this.body.metadata = { isTool: false };
    InnerMesh.metadata = { isTool: false };
    InnerMesh.position.y = -0.35;
    InnerMesh.isVisible = false;
    this.body.position.y = 20;
    this.body.position.z = -7;
  }
}
