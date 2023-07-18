import { AbstractMesh, PickingInfo, Scene, Animation } from "@babylonjs/core";
import { Inventory } from "../character/inventory/inventory";
import { QuickAccess } from "../character/inventory/quickAccess";
import rayCast from "../character/rayCast";
import LocationMeshes from "./locationMeshes";

export default class WorkScenarios {
  private location: LocationMeshes;

  constructor(
    private inventory: Inventory,
    private quickAccess: QuickAccess,
    private raycast: rayCast,
    private scene: Scene,
    private body: AbstractMesh
  ) {
    this.location = LocationMeshes.Instance(this.scene);
    this.rayCastEvents();
  }

  private rayCastEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.raycast.doItemAction(this.openCover.bind(this));
      this.raycast.doItemAction(this.unscrewTheCap.bind(this));
      this.raycast.pickDoorToHouseLocation(this.goToHomeLocation.bind(this));
      this.raycast.pickDoorToWorkshopLocation(
        this.location.disposeHomeLocation.bind(this.location)
      );
    });
  }

  private checkInstruments(instruments: number[]) {
    const needfulInstruments = instruments.reduce((acc, id) => {
      const haveInInventory = this.inventory.inventory.find(
        (item) => item.id === id
      );
      const haveInQuickAccess = this.quickAccess.quickAccess.find(
        (item) => item.id === id
      );
      if (haveInInventory || haveInQuickAccess) return acc + 1;
      else return acc;
    }, 0);

    if (instruments.length === needfulInstruments) {
      return true;
    } else {
      alert("Возьмите недостающие инструменты!");
      return false;
    }
  }

  private pumpingOutFreonCheckInstruments() {
    const instruments = [1, 32];
    return this.checkInstruments(instruments);
  }

  private async goToHomeLocation() {
    if (this.pumpingOutFreonCheckInstruments())
      await this.location.CreateHouseLocation(this.body);
  }

  private openCover(hit: PickingInfo) {
    const screwdriverID = 1;
    if (
      this.quickAccess.isInQuickAccess(screwdriverID)?.isEnabled &&
      hit.pickedMesh.metadata.id === 2
    ) {
      console.log("hello");
      hit.pickedMesh.dispose();
    }
  }

  private unscrewTheCap(hit: PickingInfo) {
    const pliersID = 32;
    if (
      (this.quickAccess.isInQuickAccess(pliersID)?.isEnabled &&
        hit.pickedMesh.metadata.id === 29) ||
      hit.pickedMesh.metadata.id === 30
    ) {
      hit.pickedMesh.rotationQuaternion = null;
      const frameRate = 10;

      const xSlide = new Animation(
        "xSlide",
        "rotation.y",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keyFrames = [];

      keyFrames.push({
        frame: 0,
        value: 0,
      });

      keyFrames.push({
        frame: frameRate,
        value: 5,
      });

      keyFrames.push({
        frame: 2 * frameRate,
        value: 10,
      });

      xSlide.setKeys(keyFrames);

      hit.pickedMesh.animations.push(xSlide);

      const anim = this.scene.beginAnimation(
        hit.pickedMesh,
        0,
        2 * frameRate,
        true
      );
      const timeout = setTimeout(() => {
        anim.stop();
        hit.pickedMesh.dispose();
        clearTimeout(timeout);
      }, 3000);
    }
  }
}
