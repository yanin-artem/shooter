import {
  UniversalCamera,
  Scene,
  Mesh,
  AbstractMesh,
  Engine,
} from "@babylonjs/core";

import Movement from "./movement";
import Pick from "./pick";

export default class playerController {
  private pick: Pick;
  private movement: Movement;

  constructor(
    private hand: AbstractMesh,
    private closedHand: AbstractMesh,
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh
  ) {
    this.movement = new Movement(this.body, this.scene, this.engine, this.head);
    this.pick = new Pick(
      this.hand,
      this.closedHand,
      this.scene,
      this.engine,
      this.head
    );
  }
  setController(): void {
    this.movement.setMovementEvents();
    this.pick.createPickEvents();
  }
}
