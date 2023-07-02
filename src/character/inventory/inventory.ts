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
import HandActions from "../handActions";
import InventoryUI from "./inventoryUI";

export default class Inventory {
  protected inventory: Array<AbstractMesh>;
  protected id = 0;
  private UI: InventoryUI;

  constructor(
    protected scene: Scene,
    protected engine: Engine,
    protected closedHand: AbstractMesh,
    protected hand: AbstractMesh,
    protected advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents
  ) {
    this.UI = new InventoryUI(
      this.inventory,
      this.scene,
      this.advancedTexture,
      this.controls,
      this.engine,
      this.hand,
      this.closedHand
    );
    this.inventory = Array(96).fill(undefined);
  }

  //функция добавления предмета сразу в инвентарь
  public addInInventory(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.checkCollisions = false;
    item.physicsImpostor.dispose();
    this.closedHand.addChild(item);
    item.position = Vector3.Zero();
    item.setEnabled(false);
    this.calcInventory(item);
  }

  //функция расчета инвентаря из двух частей - расчет массива и расчет сетки инвентаря
  private calcInventory(item: AbstractMesh) {
    this.calcArray(item, this.inventory);
    this.UI.correctStorage(this.inventory);
    this.UI.calcInventoryGrid(item);
  }

  //функция расчет массива инвентаря
  private calcArray(item: AbstractMesh, array: Array<AbstractMesh>) {
    const index = array.findIndex((item) => item === undefined);
    if (index === -1) {
      array.push(item);
    } else {
      array[index] = item;
    }
  }
}
