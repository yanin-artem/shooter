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
import Hands from "../hands";

//в сцене
export default class GeneralInvenory {
  public quickAccess: QuickAccess;
  public invetory: Inventory;
  private advancedTexture: GUI.AdvancedDynamicTexture;

  constructor(
    private scene: Scene,
    private engine: Engine,
    private hands: Hands,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.advancedTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI("main");

    this.invetory = new Inventory(
      this.scene,
      this.engine,
      this.hands,
      this.advancedTexture,
      this.controls,
      this.instruments
    );
    this.quickAccess = new QuickAccess(
      this.scene,
      this.engine,
      this.hands,
      this.advancedTexture,
      this.controls,
      this.instruments
    );
  }
}
