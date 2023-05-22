import {
  Scene,
  Engine,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
  Mesh,
  Ray,
  HighlightLayer,
} from "@babylonjs/core";

export default class Controller {
  camera: UniversalCamera;
  gunSight: Mesh;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.CreateController(this.scene, this.engine);
    this.gunSight = this.addGunSight(this.scene);
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
      new Vector3(0, 3, 0),
      this.scene
    );

    camera.attachControl();

    scene.onPointerDown = () => {
      if (!engine.isPointerLock) engine.enterPointerlock();
    };

    camera.applyGravity = true;
    camera.checkCollisions = true;

    camera.ellipsoid = new Vector3(0.4, 0.8, 0.4);

    camera.minZ = 0.45;
    camera.speed = 0.75;
    camera.inertia = 0;
    camera.angularSensibility = 600;

    return camera;
  }
}
