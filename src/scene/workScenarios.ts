import {
  AbstractMesh,
  PhysicsImpostor,
  PickingInfo,
  Scene,
} from "@babylonjs/core";
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
      hit.pickedMesh.metadata.id === 92
    ) {
      //   hit.pickedMesh.physicsImpostor = new PhysicsImpostor(
      //     hit.pickedMesh,
      //     PhysicsImpostor.BoxImpostor,
      //     { mass: 0.1 }
      //   );
      console.log("hello");
      hit.pickedMesh.dispose();
    }
  }
}
