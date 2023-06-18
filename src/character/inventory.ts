import { AbstractMesh, Engine, Scene } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import ControllEvents from "./characterControls";

export default class Inventory {
  public inventory: Array<AbstractMesh>;
  public quickAccess: Array<AbstractMesh>;
  private id = 0;
  private controls: ControllEvents;
  private inventoryGrid: GUI.Grid;
  private quickAccessGrid: GUI.Grid;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private inventoryCells: Array<GUI.Button>;
  private quickAccessCells: Array<GUI.Button>;

  constructor(private scene: Scene, private engine: Engine) {
    this.inventory = [];
    this.quickAccess = [];
    this.inventoryCells = [];
    this.quickAccessCells = [];
    this.controls = new ControllEvents();
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.createInventoryGrid();
    this.createQuickAccessGrid();
    this.showInventory();
  }
  //функция добавления предмета сразу в инвентарь
  public addInInventory(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.setEnabled(false);
    //TODO:пробегаюсь ищу пустое место вставляю
    this.calcInventory(item);
  }
  //функция удаления предмета из инвентаря
  public deleteFromQuickAccess(id: Number) {
    const index = this.quickAccess.findIndex((e) => e.metadata.id === id);
    this.quickAccess[index].setEnabled(true);
    this.quickAccess[index] = undefined;
    this.deleteCell(index, this.quickAccessCells);
  }
  //функция добавления предмета в руку и в инвентарь
  public addInInventoryAndInHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    this.calcQuickAccess(item);
  }
  //функция создания GUI сетки инвентаря
  private createInventoryGrid(): void {
    const rows = 6;
    const columns = 8;
    this.inventoryGrid = new GUI.Grid();
    this.advancedTexture.addControl(this.inventoryGrid);
    this.inventoryGrid.width = "90%";
    this.inventoryGrid.height = "60%";
    this.inventoryGrid.top = "-10%";
    for (let i = 0; i < rows; i++) {
      this.inventoryGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      this.inventoryGrid.addColumnDefinition(1 / columns);
    }
    this.inventoryGrid.isVisible = false;

    this.createInventoryCells();
  }
  private createInventoryCells(): void {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = GUI.Button.CreateSimpleButton(
          `but${row},${col}`,
          undefined
        );
        cell.color = "white";
        cell.background = "green";
        this.inventoryGrid.addControl(cell, row, col);
        this.inventoryCells.push(cell);
      }
    }
  }
  private createQuickAccessGrid() {
    const rows = 1;
    const columns = 8;
    this.quickAccessGrid = new GUI.Grid();
    this.advancedTexture.addControl(this.quickAccessGrid);
    this.quickAccessGrid.width = "90%";
    this.quickAccessGrid.height = "10%";
    this.quickAccessGrid.top = "35%";
    for (let i = 0; i < rows; i++) {
      this.quickAccessGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      this.quickAccessGrid.addColumnDefinition(1 / columns);
    }

    this.createQuickAccessCells();
  }

  private createQuickAccessCells() {
    for (let row = 0; row < 1; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = GUI.Button.CreateSimpleButton(
          `but${row},${col}`,
          undefined
        );
        cell.color = "white";
        cell.background = "gray";
        this.quickAccessGrid.addControl(cell, row, col);
        this.quickAccessCells.push(cell);
      }
    }
  }

  //функция удаления ячейки инвентаря
  private deleteCell(index: number, array: Array<GUI.Button>) {
    array[index].textBlock.text = "";
  }
  //функция показать/убрать инвентарь
  private showInventory() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      if (this.controls.showInventar) {
        this.engine.exitPointerlock();
        this.inventoryGrid.isVisible = true;
      } else {
        this.engine.enterPointerlock();
        this.inventoryGrid.isVisible = false;
      }
    });
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
    const emptyCellIndex = this.inventoryCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      this.inventoryCells[emptyCellIndex].textBlock.text = item.name;
      this.inventoryCells[emptyCellIndex].metadata = { id: item.metadata.id };
    } else return;
  }
  private calcQuickAccessGrid(item: AbstractMesh) {
    const emptyCellIndex = this.quickAccessCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      this.quickAccessCells[emptyCellIndex].textBlock.text = item.name;
      this.quickAccessCells[emptyCellIndex].metadata = { id: item.metadata.id };
    } else {
      this.calcInventoryGrid(item);
    }
  }
}