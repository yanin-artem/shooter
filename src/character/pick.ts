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
} from "@babylonjs/core";

import ControllEvents from "./characterControls";
import Inventory from "./inventory";

export default class Pick {
  private pickedItem: AbstractMesh;
  private pickedDetail: AbstractMesh;
  private detailScaleK = 3;
  private controls: ControllEvents;
  private inventory: Inventory;

  constructor(
    private hand: AbstractMesh,
    private closedHand: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh
  ) {
    this.controls = new ControllEvents();
    this.inventory = new Inventory(this.scene, this.engine);
  }

  createPickEvents(): void {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      this.dropItem();
      this.dropDetail();
      this.setPick();
      this.addIntoInventory();
      this.doItemAction();
    });
  }

  //функция броска инструмента
  //не toll  а item
  private dropItem(): void {
    if (this.controls.drop && this.pickedItem && !this.pickedDetail) {
      this.closedHand.removeChild(this.pickedItem);
      this.pickedItem.physicsImpostor = new PhysicsImpostor(
        this.pickedItem,
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1 }
      );
      this.inventory.deleteFromQuickAccess(this.pickedItem.metadata.id);
      this.pickedItem = null;
      this.toggleHand();
    } else return;
  }

  //функция подбора любого лежащего предмета
  private setPick(): void {
    if (this.controls.pickInHand && !this.pickedItem) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          ((mesh.metadata.isDetail && !mesh.metadata.isConditioner) ||
            mesh.metadata.isItem) &&
          mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        hit.pickedMesh.checkCollisions = false;
        if (hit.pickedMesh.metadata.isItem === true) {
          this.positionPickedItem(hit.pickedMesh);
          this.inventory.addInInventoryAndInHand(this.pickedItem);
        }
        if (hit.pickedMesh.metadata.isDetail === true)
          this.positionPickedDetail(hit.pickedMesh);

        this.toggleHand();
      }
    }
  }
  //функция разбора кондиционера отверткой
  private doItemAction() {
    if (
      this.pickedItem?.metadata.ItemIndex === 1 &&
      this.controls.takeApart &&
      !this.pickedDetail &&
      this.pickedItem
    ) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.isPickable && mesh.metadata.isConditioner;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh && hit.pickedMesh.metadata.isDetail) {
        hit.pickedMesh.checkCollisions = false;
        this.positionPickedDetail(hit.pickedMesh);
        this.toggleHand();
      }
    }
  }
  //бросок детали
  private dropDetail() {
    if (this.controls.drop && this.pickedDetail) {
      this.closedHand.removeChild(this.pickedDetail);
      this.pickedDetail.physicsImpostor = new PhysicsImpostor(
        this.pickedDetail,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedDetail.metadata.isConditioner = false;
      this.pickedDetail.scaling.scaleInPlace(this.detailScaleK);
      this.pickedDetail = null;
      if (this.pickedItem) this.pickedItem.isVisible = true;
      this.toggleHand();
    }
  }
  // функция смены моделей рук (сжатая или свободная)
  private toggleHand(): void {
    if (this.closedHand.getChildMeshes()[1] != null) {
      this.hand.getChildMeshes()[0].isVisible = false;
      this.closedHand.getChildMeshes()[0].isVisible = true;
    } else if (this.closedHand.getChildMeshes()[1] == null) {
      this.hand.getChildMeshes()[0].isVisible = true;
      this.closedHand.getChildMeshes()[0].isVisible = false;
    }
  }

  //функция рэйкастинга в направлении просмотра
  private castRay(predicate) {
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
    const length = 3;
    const ray = new Ray(origin, direction, length);
    return this.scene.pickWithRay(ray, predicate);
  }

  //функция позиционирования детали в руке
  private positionPickedDetail(pickedMesh: AbstractMesh) {
    this.pickedDetail = pickedMesh;
    if (this.pickedItem) {
      this.pickedItem.isVisible = false;
    }
    this.closedHand.addChild(this.pickedDetail);
    this.pickedDetail.position.set(-0.11, 0.073, 0.028);
    this.pickedDetail.scaling.scaleInPlace(1 / this.detailScaleK);
    this.pickedDetail?.physicsImpostor.dispose();
  }

  //функция позиционирования инструмента в руке
  private positionPickedItem(pickedMesh: AbstractMesh) {
    this.pickedItem = (pickedMesh.parent as AbstractMesh) || pickedMesh;
    this.pickedItem.physicsImpostor.dispose();
    this.closedHand.addChild(this.pickedItem);
    this.pickedItem.position.set(-0.11, 0.073, 0.028);
    this.pickedItem.rotationQuaternion = null;
    this.pickedItem.rotation.set(0, 0, 0);
  }

  private addIntoInventory() {
    if (this.controls.pickInInventar) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          !mesh.metadata.isDetail && mesh.metadata.isItem && mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        const item = (hit.pickedMesh.parent as AbstractMesh) || hit.pickedMesh;
        this.inventory.addInInventory(item);
      }
    }
  }
}
