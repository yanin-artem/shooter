import {
  UniversalCamera,
  Scene,
  Mesh,
  AbstractMesh,
  Engine,
} from "@babylonjs/core";

import Movement from "./movement";
import { Instruments, instrument } from "./instruments.ts/instruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import ControllEvents from "./characterControls";
import Hands from "./hands";

export default class playerController {
  private movement: Movement;

  constructor(
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private controls: ControllEvents
  ) {
    this.movement = new Movement(
      this.body,
      this.scene,
      this.engine,
      this.head,
      this.controls
    );
  }
  setController(): void {
    this.movement.setMovementEvents();
  }
}
