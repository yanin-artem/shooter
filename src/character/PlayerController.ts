import {
  UniversalCamera,
  Scene,
  Mesh,
  AbstractMesh,
  Engine,
} from "@babylonjs/core";

import Movement from "./movement";
import Pick from "./handActions";
import Instruments from "./instruments.ts/instruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import ControllEvents from "./characterControls";

export default class playerController {
  private pick: Pick;
  private movement: Movement;
  private controls: ControllEvents;
  private inventory: GeneralInvenory;

  constructor(
    private hand: AbstractMesh,
    private closedHand: AbstractMesh,
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private pickArea: Mesh,
    private instruments: Instruments
  ) {
    this.controls = new ControllEvents();
    this.movement = new Movement(
      this.body,
      this.scene,
      this.engine,
      this.head,
      this.controls
    );
    this.inventory = new GeneralInvenory(
      this.scene,
      this.engine,
      this.closedHand,
      this.hand,
      this.controls,
      this.instruments
    );
    this.pick = new Pick(
      this.hand,
      this.closedHand,
      this.scene,
      this.engine,
      this.head,
      this.pickArea,
      this.inventory,
      this.controls,
      this.instruments
    );
  }
  setController(): void {
    this.movement.setMovementEvents();
    this.pick.createPickEvents();
  }
}
