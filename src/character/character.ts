import {
  Scene,
  Engine,
  Vector3,
  MeshBuilder,
  UniversalCamera,
  StandardMaterial,
  Color3,
  Mesh,
  AbstractMesh,
  PickingInfo,
  Quaternion,
  PhysicsMotionType,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { Instruments, instrument } from "./instruments.ts/instruments";
import {
  BigInstruments,
  bigInstruments,
} from "./instruments.ts/bigInstruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import ControllEvents from "./characterControls";
import Hands from "./hands";

import playerController from "./PlayerController";
import rayCast from "./rayCast";
import WorkScenarios from "../scene/workScenarios";
import { MotionType } from "@babylonjs/havok";

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
  private raycast: rayCast;
  private scenarios: WorkScenarios;
  private bigInstruments: BigInstruments;

  constructor(private scene: Scene, private engine: Engine) {
    this.camera = this.createController(this.scene, this.engine);
    this.setBody(this.camera, this.scene);
    this.pickArea = this.createPickArea();
    this.head = this.createHead();
    this.controls = new ControllEvents();
    this.instruments = new Instruments(this.scene);
    this.bigInstruments = new BigInstruments(this.scene);
    this.hands = new Hands(this.head, this.scene);
    this.raycast = new rayCast(this.head, this.scene, this.controls, this.body);

    this.inventory = new GeneralInvenory(
      this.scene,
      this.engine,
      this.controls,
      this.instruments,
      this.bigInstruments,
      this.hands.drop.bind(this.hands),
      this.hands.openHand.bind(this.hands),
      this.hands.closeHand.bind(this.hands)
    );

    this.characterOpportunities = new playerController(
      this.body,
      this.scene,
      this.engine,
      this.head,
      this.controls
    );
    this.characterOpportunities.setController();

    this.scenarios = new WorkScenarios(
      this.inventory.invetory,
      this.inventory.quickAccess,
      this.raycast,
      this.scene,
      this.body,
      this.controls
    );
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
      diameter: 0.1,
    });
    head.parent = this.body;
    head.position.y = 0.75;
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
    this.body.position.y = 20;
  }

  private pickItem(hit: PickingInfo) {
    hit.pickedMesh.checkCollisions = false;
    if (Instruments.isInstrument(hit.pickedMesh)) {
      this.pickedItem =
        (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
      const item = this.getItemByMesh(this.pickedItem);
      this.hands.pick(item);
      this.inventory.quickAccess.addInInventoryAndInHand(item.id);
    }
    if (hit.pickedMesh.metadata?.isDetail) {
      // this.hands.positionPickedDetail(
      //   hit.pickedMesh,
      //   this.pickedDetail,
      //   this.pickedItem
      // );
    }
  }

  private pickBigItem(hit: PickingInfo) {
    hit.pickedMesh.checkCollisions = false;
    this.pickedItem = (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
    const item = this.getBigItemByMesh(this.pickedItem);
    this.hands.pickBigMesh(item, this.pickedItem.metadata?.pikcableMeshIndex);
    this.inventory.quickAccess.addInInventoryAndInHand(item.id);
  }

  protected getBigItemByMesh(mesh) {
    const id = mesh.metadata.id;
    const item = this.bigInstruments.getByID(id);
    return item;
  }

  protected getItemByMesh(mesh: AbstractMesh): instrument {
    const id = mesh.metadata.id;
    const item = this.instruments.getByID(id);
    return item;
  }

  private createPickEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      this.dropItem();
      this.dropBigItem();
      this.dropDetail();
      this.raycast.setPick(this.pickItem.bind(this));
      this.raycast.addIntoInventory(this.pickInInventory.bind(this));
      this.pickedItem = this.inventory.quickAccess.changeItemInHand(
        this.hands,
        this.pickedItem
      );
      this.raycast.pickBigInstrument(this.pickBigItem.bind(this));

      this.pickManyFromArea();
      if (event.event.code === "KeyI" && event.type === 1) {
        this.pickedItem = this.inventory.quickAccess.correctCurrentItem()?.mesh;
      }
    });
  }

  private dropItem(): void {
    if (
      this.controls.drop &&
      this.pickedItem.metadata?.isItem &&
      this.pickedItem?.isEnabled() &&
      !this.pickedDetail
    ) {
      this.hands.drop(this.pickedItem);
      const direction = this.raycast.getVisionDirection();
      this.pickedItem.physicsBody.applyImpulse(
        direction.scaleInPlace(0.5),
        this.pickedItem.position
      );
      this.inventory.quickAccess.deleteFromQuickAccessAndFromHand(
        this.pickedItem.metadata.id
      );
      this.pickedItem = null;
    } else return;
  }

  private dropBigItem(): void {
    if (
      this.controls.drop &&
      this.pickedItem.metadata?.isBigItem &&
      this.pickedItem?.isEnabled() &&
      !this.pickedDetail
    ) {
      this.hands.dropBigItem(this.pickedItem);
      // this.pickedItem.physicsBody.setMotionType(PhysicsMotionType.STATIC);
      this.pickedItem.rotationQuaternion = null;
      this.pickedItem.rotation.set(0, 0, Math.PI);

      this.inventory.quickAccess.deleteFromQuickAccessAndFromHand(
        this.pickedItem.metadata.id
      );
      this.pickedItem = null;
    } else return;
  }

  //бросок детали
  private dropDetail() {
    if (this.controls.drop && this.pickedDetail) {
      this.pickedDetail.metadata.isConditioner = false;
      //TODO: ТУТ БУДЕТ ЧТО-ТО ТИПО this.hands.dettachDetailFromHand
      // this.pickedDetail.scaling.scaleInPlace(this.detailScaleK);
      this.pickedDetail = null;
      if (this.pickedItem?.isEnabled()) this.pickedItem.isVisible = true;
    }
  }

  //pick item
  private pickInInventory(hit: PickingInfo) {
    this.pickedItem = (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
    const item = this.getItemByMesh(this.pickedItem);
    this.hands.attachToHand(item);
    this.inventory.invetory.addInInventory(item.id);
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
