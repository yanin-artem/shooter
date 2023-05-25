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
import Controls from "./controls";

export default class Character {
  camera: UniversalCamera;
  protected _gunSight: Mesh;
  body: Mesh;
  hand: TransformNode;
  characterOpportunities: Controls;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this._createController(this.scene, this.engine);

    this._setBody(this.camera, this.scene);
    this._createHand(this.camera);

    this.characterOpportunities = new Controls(
      this.camera,
      this.hand,
      this.scene
    );
    this.characterOpportunities.setControls();
  }

  private _createController(scene: Scene, engine: Engine): UniversalCamera {
    const camera = new UniversalCamera(
      "camera",
      new Vector3(0, 2.22, 0),
      this.scene
    );

    camera.attachControl();

    scene.onPointerDown = () => {
      if (!engine.isPointerLock) engine.enterPointerlock();
    };

    camera.applyGravity = true;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(0.4, 1.7, 0.4);
    camera.ellipsoidOffset = new Vector3(0, 1.7, 0);

    camera.minZ = 0;
    camera.speed = 0.75;
    camera.inertia = 0;
    camera.angularSensibility = 600;

    this._gunSight = this._addGunSight(scene);

    return camera;
  }

  private _addGunSight(scene: Scene): Mesh {
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
    return gunSight;
  }

  private async _createHand(camera: UniversalCamera): Promise<void> {
    this.hand = new TransformNode("hand");
    this.hand.position.x = camera.position.x + 0.2;
    this.hand.position.y -= 0.15;
    this.hand.parent = camera;
    this.hand.position.z = camera.position.z + 0.2;

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

  private _setBody(camera: UniversalCamera, scene: Scene): Mesh {
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

    const body = Mesh.MergeMeshes([body1, body2]);

    const bodyNode = new TransformNode("bodyNode", scene);
    bodyNode.parent = camera;
    bodyNode.billboardMode = 2;
    bodyNode.position.y -= 0.85;
    body.isPickable = false;
    body.parent = bodyNode;

    return body;
  }
}
