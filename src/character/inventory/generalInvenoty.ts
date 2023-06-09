import {
  AbstractMesh,
  Engine,
  Scene,
  PhysicsImpostor,
  KeyboardInfo,
  Vector3,
  Vector2,
  PointerEventTypes,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import ControllEvents from "../characterControls";
import { Inventory } from "./inventory";
import { Instruments, instrument } from "../instruments.ts/instruments";
import { QuickAccess } from "./quickAccess";

//в сцене
export default class GeneralInvenory {
  public quickAccess: QuickAccess;
  public invetory: Inventory;
  private advancedTexture: GUI.AdvancedDynamicTexture;

  constructor(
    private scene: Scene,
    private engine: Engine,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.advancedTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI("main");

    this.invetory = new Inventory(
      this.scene,
      this.engine,
      this.advancedTexture,
      this.controls,
      this.instruments
    );
    this.quickAccess = new QuickAccess(
      this.invetory,
      this.scene,
      this.engine,
      this.advancedTexture,
      this.controls,
      this.instruments
    );
  }
}
