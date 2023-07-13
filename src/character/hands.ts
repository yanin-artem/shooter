import {
  AbstractMesh,
  AnimationGroup,
  Bone,
  Engine,
  Mesh,
  PhysicsImpostor,
  Ray,
  Scene,
  SceneLoader,
  Skeleton,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import ControllEvents from "./characterControls";
import { Instruments, instrument } from "./instruments.ts/instruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import { quickAccessItem } from "./inventory/quickAccess";

export default class Hands {
  public hand: any;
  public mesh: AbstractMesh;
  public rootNode: TransformNode;
  public skeletons: Skeleton;
  private attachedMeshes: AbstractMesh[];
  private hold: AnimationGroup;
  private open: AnimationGroup;
  private pickedItem: AbstractMesh;
  private pickedDetail: AbstractMesh;
  private detailScaleK = 3;
  private itemsStorage: Array<any>;

  constructor(
    private parentNode: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private pickArea: Mesh,
    private inventory: GeneralInvenory,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.attachedMeshes = [];
    this.createHand();
    this.changeOnEventHands();
  }
  private async createHand() {
    const loadObject = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/character/",
      "normal_hands_anim.glb"
    );
    this.open = loadObject.animationGroups[1];
    this.hold = loadObject.animationGroups[0];
    this.open.start(true, 1, this.open.from, this.open.to, false);
    console.log("hello");
    this.mesh = loadObject.meshes[1];
    this.skeletons = this.mesh.skeleton;
    this.hand = loadObject.meshes[0];
    this.mesh.metadata = { isItem: false, isConditionder: false };
    this.hand.metadata = { isItem: false, isConditionder: false };
    this.rootNode = loadObject.transformNodes[108];
    this.hand.parent = this.parentNode;
    this.hand.position.y = -1.6;
  }
  public closeHand() {
    this.open.stop();
    this.hold.start(true, 1, this.hold.from, this.hold.to, false);
  }

  public openHand() {
    this.hold.stop();
    this.open.start(true, 1, this.open.from, this.open.to, false);
  }

  private changeOnEventHands() {
    document.addEventListener("addInInventory", (event: CustomEvent) => {
      this.attachToHand(event.detail.item);
    });
    document.addEventListener("dropInQuickAccess", () => {
      this.closeHand();
    });
    document.addEventListener("dropInInventory", () => {
      this.openHand();
    });
    document.addEventListener("dropFromInventory", (event: CustomEvent) => {
      this.dettachFromHand(event.detail.item.mesh);
    });
  }

  public attachToHand(item: instrument) {
    this.attachedMeshes.push(item.mesh);
    this.positionPickedItem(
      this.skeletons.bones[11],
      this.mesh.parent as TransformNode,
      item
    );
  }

  public dettachFromHand(item: AbstractMesh) {
    const index = this.attachedMeshes.findIndex(
      (mesh) => mesh.metadata.id === item.metadata.id
    );
    this.attachedMeshes.splice(index, 1);
  }

  createPickEvents(): void {
    this.scene.onKeyboardObservable.add((event) => {
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

  //функция броска инструмента
  //не toll  а item
  private dropItem(): void {
    if (
      this.controls.drop &&
      this.pickedItem?.isEnabled() &&
      !this.pickedDetail
    ) {
      const position = this.pickedItem.absolutePosition;
      this.pickedItem.detachFromBone();
      this.dettachFromHand(this.pickedItem);
      this.openHand();
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
          this.attachToHand(item);
          this.closeHand();
          this.inventory.quickAccess.addInInventoryAndInHand(
            this.pickedItem.metadata.id
          );
        }
        if (hit.pickedMesh.metadata?.isDetail)
          this.positionPickedDetail(hit.pickedMesh);
      }
    }
  }

  //бросок детали
  private dropDetail() {
    if (this.controls.drop && this.pickedDetail) {
      this.mesh.removeChild(this.pickedDetail);
      this.pickedDetail.physicsImpostor = new PhysicsImpostor(
        this.pickedDetail,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedDetail.metadata.isConditioner = false;
      this.pickedDetail.scaling.scaleInPlace(this.detailScaleK);
      this.pickedDetail = null;
      if (this.pickedItem?.isEnabled()) this.pickedItem.isVisible = true;
    }
  }
  // функция смены моделей рук (сжатая или свободная)

  //функция рэйкастинга в направлении просмотра
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

  //функция позиционирования детали в руке
  private positionPickedDetail(pickedMesh: AbstractMesh) {
    this.pickedDetail = pickedMesh;
    if (this.pickedItem?.isEnabled()) {
      this.pickedItem.isVisible = false;
    }
    this.mesh.addChild(this.pickedDetail);
    this.pickedDetail.position.set(-0.11, 0.073, 0.028);
    this.pickedDetail.scaling.scaleInPlace(1 / this.detailScaleK);
    this.pickedDetail?.physicsImpostor.dispose();
  }

  //функция позиционирования инструмента в руке
  private positionPickedItem(
    bone: Bone,
    node: TransformNode,
    item: instrument
  ) {
    item.mesh.physicsImpostor?.dispose();
    item.mesh.attachToBone(bone, node);
    item.mesh.position = item.position;
    item.mesh.rotationQuaternion = null;
    item.mesh.rotation.x = item.rotation.x;
    item.mesh.rotation.y = item.rotation.y;
    item.mesh.rotation.z = item.rotation.z;
  }

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
        this.inventory.invetory.addInInventory(item.metadata.id);
      }
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
      this.openHand();
    }
    if (quickAccess[index].id != -1) {
      quickAccess[index].isEnabled = true;
      const instrument = this.instruments.getByID(quickAccess[index].id);
      this.pickedItem = instrument.mesh;
      instrument.isActive = true;
      this.pickedItem.setEnabled(true);
      this.closeHand();
    }
  }
  private pickManyFromArea() {
    if (this.controls.manyPick) {
      this.itemsStorage.forEach((item) => {
        if (
          item.mesh.intersectsMesh(this.pickArea) &&
          !item.mesh.physicsImpostor.isDisposed
        ) {
          this.inventory.invetory.addInInventory(item.mesh);
        }
      });
    }
  }
}
