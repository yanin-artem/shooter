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
  Ray,
  PhysicsImpostor,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Instruments, instrument } from "./instruments.ts/instruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import ControllEvents from "./characterControls";
import Hands from "./hands";

import playerController from "./PlayerController";
import { quickAccessItem } from "./inventory/quickAccess";

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
  private controls: ControllEvents;
  private inventory: GeneralInvenory;
  private instruments: Instruments;
  private pickedItem: AbstractMesh;
  private pickedDetail: AbstractMesh;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.createController(this.scene, this.engine);
    this.setBody(this.camera, this.scene);
    this.pickArea = this.createPickArea();
    this.head = this.createHead();
    this.controls = new ControllEvents();
    this.instruments = new Instruments();

    this.inventory = new GeneralInvenory(
      this.scene,
      this.engine,
      this.controls,
      this.instruments
      //this.hands.deleteItem
    );

    this.hands = new Hands(this.head, this.scene);
    this.characterOpportunities = new playerController(
      this.hands,
      this.body,
      this.scene,
      this.engine,
      this.head,
      this.pickArea,
      this.controls
    );
    this.characterOpportunities.setController();

    this.hands.createPickEvents();
    this.createPickEvents();
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
    head.position.y = 0.8;
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
      height: 1.7,
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
    InnerMesh.position.y = -0.15;
    // InnerMesh.isVisible = false;
    this.body.position.y = 20;
    // this.body.position.z = -7;
  }

  private castRay(predicate) {
    const direction = this.getVisionDirection();
    const length = 3;
    const origin = this.head.getAbsolutePosition();
    const ray = new Ray(origin, direction, length);
    return this.scene.pickWithRay(ray, predicate);
  }

  private getVisionDirection(): Vector3 {
    function vecToLocal(vector: Vector3): Vector3 {
      const m = this.head.getWorldMatrix();
      const v = Vector3.TransformCoordinates(vector, m);
      return v;
    }
    const origin = this.head.getAbsolutePosition();
    let forward = new Vector3(0, 0, 1);
    forward = vecToLocal.call(this, forward);
    let direction = forward.subtract(origin);
    direction = Vector3.Normalize(direction);

    return direction;
  }

  //функция подбора любого лежащего предмета
  private setPick(): void {
    if (this.controls.pickInHand) {
      function predicate(
        mesh: AbstractMesh,
        instruments: Instruments
      ): boolean {
        return (
          ((mesh.metadata?.isDetail && !mesh.metadata?.isConditioner) ||
            Instruments.isInstrument(mesh)) &&
          mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        hit.pickedMesh.checkCollisions = false;
        if (Instruments.isInstrument(hit.pickedMesh)) {
          this.pickedItem =
            (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
          const id = this.pickedItem.metadata.id;
          const item = this.instruments.getByID(id);
          this.hands.attachToHand(item);
          this.hands.closeHand();
          this.inventory.quickAccess.addInInventoryAndInHand(
            this.pickedItem.metadata.id
          );
        }
        if (hit.pickedMesh.metadata?.isDetail)
          this.hands.positionPickedDetail(
            hit.pickedMesh,
            this.pickedDetail,
            this.pickedItem
          );
      }
    }
  }

  private createPickEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      this.dropItem();
      this.setPick();
      this.controls.handleControlEvents(event);
      this.dropItem();
      this.dropDetail();
      this.setPick();
      this.addIntoInventory();
      if (this.controls.number) {
        this.changeItemInHand(
          this.controls.number - 1,
          this.inventory.quickAccess.quickAccess
        );
      }
      this.pickManyFromArea();
      if (event.event.code === "KeyI" && event.type === 1) {
        this.pickedItem = this.inventory.quickAccess.correctCurrentItem()?.mesh;
      }
    });
  }

  private dropItem(): void {
    if (
      this.controls.drop &&
      this.pickedItem?.isEnabled() &&
      !this.pickedDetail
    ) {
      const position = this.pickedItem.absolutePosition;
      this.pickedItem.detachFromBone();
      this.hands.dettachFromHand(this.pickedItem);
      this.hands.openHand();
      this.pickedItem.position = position;
      this.pickedItem.physicsImpostor = new PhysicsImpostor(
        this.pickedItem,
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1, friction: 0.9 }
      );
      const direction = this.getVisionDirection();
      this.pickedItem.applyImpulse(
        direction.scaleInPlace(0.5),
        this.pickedItem.position
      );
      this.inventory.quickAccess.deleteFromQuickAccessAndFromHand(
        this.pickedItem.metadata.id
      );
      this.pickedItem = null;
    } else return;
  }

  //бросок детали
  private dropDetail() {
    if (this.controls.drop && this.pickedDetail) {
      this.pickedDetail.physicsImpostor = new PhysicsImpostor(
        this.pickedDetail,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedDetail.metadata.isConditioner = false;
      //TODO: ТУТ БУДЕТ ЧТО-ТО ТИПО this.hands.dettachDetailFromHand
      // this.pickedDetail.scaling.scaleInPlace(this.detailScaleK);
      this.pickedDetail = null;
      if (this.pickedItem?.isEnabled()) this.pickedItem.isVisible = true;
    }
  }

  private changeItemInHand(index: number, quickAccess: Array<quickAccessItem>) {
    this.inventory.quickAccess.UI.toggleQuickAccessVisibility();

    const enabledElem = quickAccess.find((item) => item.isEnabled);
    if (enabledElem) {
      enabledElem.isEnabled = false;
      const instrument = this.instruments.getByID(enabledElem.id);
      instrument.isActive = false;
      const enabledMesh = instrument.mesh;
      enabledMesh.setEnabled(false);
      this.hands.openHand();
    }
    if (quickAccess[index].id != -1) {
      quickAccess[index].isEnabled = true;
      const instrument = this.instruments.getByID(quickAccess[index].id);
      this.pickedItem = instrument.mesh;
      instrument.isActive = true;
      this.pickedItem.setEnabled(true);
      this.hands.closeHand();
    }
  }

  //pick item
  private addIntoInventory() {
    if (this.controls.pickInInventar) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          !mesh.metadata?.isDetail && mesh.metadata?.isItem && mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        const item = (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
        const instrument = this.instruments.getByID(item.metadata.id);
        this.hands.attachToHand(instrument);
        this.inventory.invetory.addInInventory(item.metadata.id);
      }
    }
  }

  private pickManyFromArea() {
    // if (this.controls.manyPick) {
    //   this.itemsStorage.forEach((item) => {
    //     if (
    //       item.mesh.intersectsMesh(this.pickArea) &&
    //       !item.mesh.physicsImpostor.isDisposed
    //     ) {
    //       this.inventory.invetory.addInInventory(item.mesh);
    //     }
    //   });
    // }
  }
}
