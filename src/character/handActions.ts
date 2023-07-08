import {
  Vector3,
  Scene,
  Ray,
  KeyboardInfo,
  Mesh,
  AbstractMesh,
  PhysicsImpostor,
  PointerInfo,
  Engine,
  ExecuteCodeAction,
  ActionManager,
  MeshBuilder,
  TransformNode,
} from "@babylonjs/core";
import { quickAccessItem } from "./inventory/quickAccess";
import Instrument from "./instruments.ts/instrument";

import ControllEvents from "./characterControls";
import GeneralInvenory from "./inventory/generalInvenoty";
import Instruments from "./instruments.ts/instruments";
import Hands from "./hands";

export default class HandActions {
  private pickedItem: AbstractMesh;
  private pickedDetail: AbstractMesh;
  private detailScaleK = 3;

  private itemsStorage: Array<any>;

  constructor(
    public hands: Hands,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private pickArea: Mesh,
    private inventory: GeneralInvenory,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {}

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
      this.hands.dettachFromHand(this.pickedItem);
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
      this.pickedItem.rotation = Vector3.Zero();
      this.inventory.quickAccess.deleteFromQuickAccessAndFromHand(
        this.pickedItem.metadata.id
      );
      this.pickedItem = null;
    } else return;
  }

  //функция подбора любого лежащего предмета
  private setPick(): void {
    if (this.controls.pickInHand) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          ((mesh.metadata?.isDetail && !mesh.metadata?.isConditioner) ||
            Instrument.isInstrument(mesh)) &&
          mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        hit.pickedMesh.checkCollisions = false;
        if (Instrument.isInstrument(hit.pickedMesh)) {
          this.pickedItem =
            (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
          const id = this.pickedItem.metadata.id;
          const item = this.instruments.getById(id);
          item.positionInHand(
            this.hands.skeletons.bones[11],
            this.hands.mesh.parent as TransformNode
          );
          this.hands.attachToHand(item.mesh);
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
      this.hands.mesh.removeChild(this.pickedDetail);
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
    this.hands.mesh.addChild(this.pickedDetail);
    this.pickedDetail.position.set(-0.11, 0.073, 0.028);
    this.pickedDetail.scaling.scaleInPlace(1 / this.detailScaleK);
    this.pickedDetail?.physicsImpostor.dispose();
  }

  //функция позиционирования инструмента в руке
  private positionPickedItem() {
    this.pickedItem.physicsImpostor?.dispose();
    this.hands.mesh.addChild(this.pickedItem);
    this.pickedItem.position.set(-0.11, 0.073, 0.028);
    this.pickedItem.rotationQuaternion = null;
    this.pickedItem.rotation.set(0, 0, 0);
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
    console.log(quickAccess);

    const enabledElem = quickAccess.find((item) => item.isEnabled);
    if (enabledElem) {
      enabledElem.isEnabled = false;
      const instrument = this.instruments.getById(enabledElem.id);
      instrument.isActive = false;
      const enabledMesh = instrument.mesh;
      enabledMesh.setEnabled(false);
    }
    if (quickAccess[index].id != -1) {
      quickAccess[index].isEnabled = true;
      const instrument = this.instruments.getById(quickAccess[index].id);
      this.pickedItem = instrument.mesh;
      instrument.isActive = true;
      this.pickedItem.setEnabled(true);
    }
    console.log(this.pickedItem?.name);
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
