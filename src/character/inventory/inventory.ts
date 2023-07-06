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
import InventoryUI from "./inventoryUI";
import Instruments from "../instruments.ts/instruments";
import Hands from "../hands";
export type inventoryItem = {
  id: number;
};

export class Inventory {
  protected inventory: Array<inventoryItem>;
  protected id = 0;
  private UI: InventoryUI;

  constructor(
    protected scene: Scene,
    protected engine: Engine,
    protected hands: Hands,
    protected advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.UI = new InventoryUI(
      this.inventory,
      this.scene,
      this.advancedTexture,
      this.controls,
      this.engine,
      this.hands,
      this.instruments
    );
    this.inventory = Array(96).fill({ id: -1 });
  }

  //функция добавления предмета сразу в инвентарь
  public addInInventory(id: number) {
    const instrument = this.instruments.getById(id);
    instrument.mesh.checkCollisions = false;
    instrument.mesh.physicsImpostor?.dispose();
    instrument.mesh.setParent(this.hands.rootNode);
    instrument.mesh.position = Vector3.Zero();
    instrument.mesh.setEnabled(false);
    this.calcInventory(id, instrument);
  }

  //функция расчета инвентаря из двух частей - расчет массива и расчет сетки инвентаря
  private calcInventory(id: number, instrument: any) {
    this.calcArray(id);
    this.UI.correctStorage(this.inventory);
    this.UI.calcInventoryGrid(instrument);
    console.log(this.inventory);
  }

  //функция расчет массива инвентаря
  private calcArray(id: number) {
    const index = this.inventory.findIndex((item) => item.id === -1);
    if (index === -1) {
      this.inventory.push({ id: id });
    } else {
      this.inventory[index] = { id: id };
    }
  }
}
