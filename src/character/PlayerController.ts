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
import Hands from "./hands";

export default class playerController {
  private pick: Pick;
  private movement: Movement;
  private controls: ControllEvents;
  private inventory: GeneralInvenory;
  private instruments: Instruments;

  constructor(
    private hands: Hands,
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private pickArea: Mesh
  ) {
    this.controls = new ControllEvents();
    this.instruments = new Instruments(this.scene, this.head, this.controls);
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
      this.hands,
      this.controls,
      this.instruments
    );
    this.pick = new Pick(
      this.hands,
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
