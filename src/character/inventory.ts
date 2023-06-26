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
import ControllEvents from "./characterControls";
import InventoryInteractions from "./inventoryInteractions";
import { inventoryEntities as entities } from "./inventoryEntities";
import HandActions from "./handActions";

export default class Inventory {
  protected inventory: Array<AbstractMesh>;
  public quickAccess: Array<AbstractMesh>;
  protected id = 0;
  protected controls: ControllEvents;

  constructor(
    protected scene: Scene,
    protected engine: Engine,
    protected closedHand: AbstractMesh,
    protected hand: AbstractMesh
  ) {
    this.inventory = [];
    this.quickAccess = [];

    this.controls = new ControllEvents();
    new entities();
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
  //функция удаления предмета из инвентаря
  public deleteFromQuickAccessAndFromHand(id: Number) {
    const index = this.quickAccess.findIndex((e) => e?.metadata.id === id);
    if (index != -1) {
      this.quickAccess[index].setEnabled(true);
      this.quickAccess[index] = undefined;
      this.deleteCell(index, entities.quickAccessCells);
    } else return;
  }

  //функция добавления предмета в руку и в инвентарь
  public addInInventoryAndInHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    if (this.quickAccess.length > 0) {
      this.quickAccess.forEach((item) => item?.setEnabled(false));
    }
    this.calcQuickAccess(item);
  }

  //функция удаления ячейки инвентаря
  protected deleteCell(index: number, array: Array<GUI.Button>) {
    array[index].textBlock.text = "";
    array[index].image.source = "";
  }

  //функция расчета инвентаря из двух частей - расчет массива и расчет сетки инвентаря
  private calcInventory(item: AbstractMesh) {
    this.calcArray(item, this.inventory);
    this.calcInventoryGrid(item);
  }
  private calcQuickAccess(item: AbstractMesh) {
    this.calcArray(item, this.quickAccess);
    this.calcQuickAccessGrid(item);
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
  //функция расчета сетки инвентаря
  private calcInventoryGrid(item: AbstractMesh) {
    const emptyCellIndex = entities.inventoryCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      entities.inventoryCells[emptyCellIndex].textBlock.text = item.name;
      entities.inventoryCells[emptyCellIndex].image.source =
        "../assets/images/" + item.name + ".jpg";
      entities.inventoryCells[emptyCellIndex].metadata = {
        id: item.metadata.id,
      };
    } else return;
  }
  private calcQuickAccessGrid(item: AbstractMesh) {
    const emptyCellIndex = entities.quickAccessCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      entities.quickAccessCells[emptyCellIndex].textBlock.text = item.name;
      entities.quickAccessCells[emptyCellIndex].image.source =
        "../assets/images/" + item.name + ".jpg";
      entities.quickAccessCells[emptyCellIndex].metadata = {
        id: item.metadata.id,
      };
    } else {
      this.calcInventoryGrid(item);
    }
  }

  protected disableDropButton() {
    if (entities.inventoryGrid.getChildByName(entities.dropButton.name)) {
      entities.inventoryGrid.removeControl(entities.dropButton);
    } else if (
      entities.quickAccessGrid.getChildByName(entities.dropButton.name)
    ) {
      entities.quickAccessGrid.removeControl(entities.dropButton);
    }
  }
  //удаление предмета в интерфейсе инвентаря
  protected deleteItem(
    id: Number,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    const index = meshArray.findIndex((e) => e?.metadata.id === id);
    if (index != -1) {
      meshArray[index].setEnabled(true);
      this.closedHand.removeChild(meshArray[index]);
      meshArray[index].physicsImpostor = new PhysicsImpostor(
        meshArray[index],
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1 }
      );
      meshArray[index] = undefined;
      HandActions.toggleHand(this.closedHand, this.hand, meshArray[index]);
      this.deleteCell(index, cellsArray);
    } else return;
  }
}
