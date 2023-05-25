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
} from "@babylonjs/core";
import "@babylonjs/loaders";

export default class Controller {
  camera: UniversalCamera;
  gunSight: Mesh;
  body: Mesh;
  hand: TransformNode;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.CreateController(this.scene, this.engine);
    this.gunSight = this.addGunSight(this.scene);
    this.createHand();
  }

  addGunSight(scene: Scene): Mesh {
    if (scene.activeCameras.length === 0) {
      scene.activeCameras.push(scene.activeCamera);
    }

    const secondCamera = new UniversalCamera(
      "GunSightCamera",
      new Vector3(0, 0, -50),
      scene
    );
    secondCamera.mode = UniversalCamera.ORTHOGRAPHIC_CAMERA;
    secondCamera.layerMask = 0x20000000;
    scene.activeCameras.push(secondCamera);

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
    return gunSight;
  }

  CreateController(scene: Scene, engine: Engine): UniversalCamera {
    const camera = new UniversalCamera(
      "camera",
      new Vector3(0, 1.7, 0),
      this.scene
    );

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

    this.body = Mesh.MergeMeshes([body1, body2]);

    const bodyNode = new TransformNode("bodyNode", this.scene);
    bodyNode.parent = camera;
    bodyNode.billboardMode = 2;
    bodyNode.position.y -= 0.85;
    this.body.isPickable = false;
    this.body.parent = bodyNode;

    // для демонтрации тела
    // this.body.position.z += 2;

    camera.attachControl();

    // scene.onPointerDown = () => {
    //   if (!engine.isPointerLock) engine.enterPointerlock();
    // };

    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(0.4, 1.7, 0.4);
    camera.ellipsoidOffset = new Vector3(0, 1.7, 0);

    camera.minZ = 0;
    camera.speed = 0.75;
    camera.inertia = 0;
    camera.angularSensibility = 600;

    return camera;
  }

  async createHand(): Promise<void> {
    this.hand = new TransformNode("hand");
    this.hand.position.z = this.camera.position.z + 0.2;
    this.hand.position.x = this.camera.position.x + 0.2;
    this.hand.position.y -= 0.15;
    this.hand.parent = this.camera;

    this.hand.rotation = new Vector3(-1, 2.5, 0);

    const meshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "handbynadevaynoskix.obj"
    );

    meshes.meshes.forEach((mesh) => {
      mesh.scaling = new Vector3(0.02, 0.02, 0.02);
      mesh.parent = this.hand;
      mesh.isPickable = false;
    });
  }
}