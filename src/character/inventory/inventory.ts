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
import { Instruments, instrument } from "../instruments.ts/instruments";
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
    protected advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.inventory = Array(96).fill(undefined);
    this.inventory = this.inventory.map(() => {
      return { id: -1 };
    });

    this.UI = new InventoryUI(
      this.inventory,
      this.scene,
      this.advancedTexture,
      this.controls,
      this.engine,
      this.instruments
    );
  }

  //функция добавления предмета сразу в инвентарь
  public addInInventory(id: number) {
    const instrument = this.instruments.getByID(id);
    instrument.mesh.checkCollisions = false;
    instrument.mesh.physicsImpostor?.dispose();
    instrument.isActive = false;
    instrument.mesh.setEnabled(false);
    this.calcInventory(id, instrument);
  }

  //функция расчета инвентаря из двух частей - расчет массива и расчет сетки инвентаря
  private calcInventory(id: number, instrument: any) {
    this.calcArray(id);
    this.UI.correctStorage(this.inventory);
    this.UI.calcInventoryGrid(instrument);
  }

  //функция расчет массива инвентаря
  private calcArray(id: number) {
    const index = this.inventory.findIndex((item) => item.id === -1);
    if (index === -1) {
      const item = this.instruments.getByID(id);
      //если инвентарь заполнен, то предмет бросается
      const event = new CustomEvent("dropFromInventory", {
        detail: { item: item },
        bubbles: true,
        cancelable: true,
        composed: false,
      });
      document.dispatchEvent(event);
    } else {
      this.inventory[index] = { id: id };
    }
  }
}
