import { AbstractMesh, Ray, Scene, Vector3 } from "@babylonjs/core";
import ControllEvents from "./characterControls";
import { Instruments } from "./instruments.ts/instruments";
import LocationMeshes from "../scene/locationMeshes";

export default class rayCast {
  constructor(
    private head: AbstractMesh,
    private scene: Scene,
    private controls: ControllEvents,
    private body: AbstractMesh
  ) {}
  private castRay(predicate) {
    const direction = this.getVisionDirection();
    const length = 3;
    const origin = this.head.getAbsolutePosition();
    const ray = new Ray(origin, direction, length);
    return this.scene.pickWithRay(ray, predicate);
  }

  public getVisionDirection(): Vector3 {
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
  public setPick(pickCallBack): void {
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
        pickCallBack(hit);
      }
    }
  }

  //pick item
  public addIntoInventory(addIntoInventoryCallBack) {
    if (this.controls.pickInInventar) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          !mesh.metadata?.isDetail && mesh.metadata?.isItem && mesh.isPickable
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        addIntoInventoryCallBack(hit);
      }
    }
  }

  public doItemAction(itemActionCallBack) {
    if (this.controls.useItem) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.isDetail;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        itemActionCallBack(hit);
      }
    }
  }

  public doItemActionWithOtherItem(itemActionCallBack) {
    if (this.controls.useItem) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.isBigItem;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        itemActionCallBack(hit);
      }
    }
  }

  public pickPlacementArea(placementCallBack) {
    if (this.controls.useItem) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.conditionerArea;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        placementCallBack(hit);
      }
    }
  }

  //pick item
  public async pickDoorToHouseLocation(callback): Promise<void> {
    if (this.controls.pickInInventar) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.isDoorToHouse && mesh.isPickable;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        callback();
      }
    }
  }

  public pickDoorToWorkshopLocation(callback) {
    if (this.controls.pickInInventar) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.isDoorToWorkshop && mesh.isPickable;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        callback();
      }
    }
  }

  public pickBigInstrument(pickCallBack) {
    if (this.controls.pickInHand) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.isBigItem && mesh.isPickable && mesh.isEnabled();
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        pickCallBack(hit);
      }
    }
  }
  public rotateInstrumentPart(rotateCallBack) {
    if (this.controls.deltaScroll) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata?.rotationPart && mesh.isPickable;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        rotateCallBack(hit, this.controls.deltaScroll);
      }
    }
  }
}
