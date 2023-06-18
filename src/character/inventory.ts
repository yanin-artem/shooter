import {
  AbstractMesh,
  Engine,
  Scene,
  PhysicsImpostor,
  KeyboardInfo,
} from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import ControllEvents from "./characterControls";
import HandActions from "./handActions";

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
  private dropButton: GUI.Button;
  private selectedItem: AbstractMesh;

  constructor(
    private scene: Scene,
    private engine: Engine,
    private closedHand: AbstractMesh,
    private hand: AbstractMesh
  ) {
    this.inventory = [];
    this.quickAccess = [];
    this.inventoryCells = [];
    this.quickAccessCells = [];
    this.controls = new ControllEvents();
    this.createDropButton();
    this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.createInventoryGrid();
    this.createQuickAccessGrid();
    this.inventoryEvents();
  }
  //функция добавления предмета сразу в инвентарь
  public addInInventory(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.setEnabled(false);
    this.calcInventory(item);
  }
  //функция удаления предмета из инвентаря
  public deleteFromQuickAccessAndFromHand(id: Number) {
    const index = this.quickAccess.findIndex((e) => e.metadata.id === id);
    if (index != -1) {
      this.quickAccess[index].setEnabled(true);
      this.quickAccess[index] = undefined;
      this.deleteCell(index, this.quickAccessCells);
    } else return;
  }

  private deleteItem(
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
      this.hand.removeChild(meshArray[index]);
      meshArray[index] = undefined;
      HandActions.toggleHand(this.closedHand, this.hand);
      this.deleteCell(index, cellsArray);
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
    this.selectedItem = item;
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
        cell.isPointerBlocker = true;
        this.inventoryGrid.addControl(cell, row, col);
        this.inventoryCells.push(cell);
        cell.onPointerClickObservable.add(() => {
          this.showDropButton(
            cell,
            this.inventoryGrid,
            this.inventory,
            this.inventoryCells
          );
        });
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
        cell.isPointerBlocker = true;
        cell.onPointerClickObservable.add(() =>
          this.showDropButton(
            cell,
            this.quickAccessGrid,
            this.quickAccess,
            this.quickAccessCells
          )
        );
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
    if (this.controls.showInventar) {
      this.engine.exitPointerlock();
      this.inventoryGrid.isVisible = true;
    } else {
      this.engine.enterPointerlock();
      this.inventoryGrid.isVisible = false;
      this.disableDropButton();
    }
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

  private createDropButton() {
    this.dropButton = GUI.Button.CreateSimpleButton("drop", "выбросить");
    this.dropButton.color = "white";
    this.dropButton.background = "black";
    this.dropButton.height = "40%";
  }

  private showDropButton(
    cell: GUI.Button,
    grid: GUI.Grid,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    this.disableDropButton();
    if (cell.metadata?.id != undefined) {
      this.dropButton.onPointerClickObservable.clear();
      const cellCoordinates = grid.getChildCellInfo(cell).split(":");
      grid.addControl(
        this.dropButton,
        +cellCoordinates[0],
        +cellCoordinates[1]
      );
      this.dropButton.onPointerClickObservable.addOnce(() => {
        this.deleteItem(cell.metadata.id, meshArray, cellsArray);
      });
    } else return;
  }

  private disableDropButton() {
    if (this.inventoryGrid.getChildByName(this.dropButton.name)) {
      this.inventoryGrid.removeControl(this.dropButton);
    } else if (this.quickAccessGrid.getChildByName(this.dropButton.name)) {
      this.quickAccessGrid.removeControl(this.dropButton);
    }
  }
  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);

      this.showInventory();
      this.changeItemInQuickAccess();
    });
  }
  private changeItemInQuickAccess() {
    if (this.controls.number) {
      this.selectedItem?.setEnabled(false);
      this.selectedItem = this.quickAccess[this.controls.number - 1];
      this.selectedItem?.setEnabled(true);
    }
  }
}
