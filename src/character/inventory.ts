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
  private draggingItem: GUI.Button;
  private cursorPos: Vector2;
  private cellPos: Vector2;
  private textBlock: GUI.Rectangle;
  private title: GUI.TextBlock;
  private description: GUI.TextBlock;
  private rightSliderButton: GUI.Button;
  private leftSliderButton: GUI.Button;
  private inventoryWrapper: GUI.Rectangle;

  constructor(
    private scene: Scene,
    private engine: Engine,
    private closedHand: AbstractMesh,
    private hand: AbstractMesh
  ) {
    this.cursorPos = Vector2.Zero();
    this.cellPos = Vector2.Zero();
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
    this.hadleDragging();
    this.createTextBlock();
    this.createSliderButtons();
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
      HandActions.toggleHand(
        this.closedHand,
        this.hand,
        this.quickAccess,
        meshArray[index]
      );
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
    this.calcQuickAccess(item);
  }
  //функция создания GUI сетки инвентаря
  private createInventoryGrid(): void {
    const rows = 6;
    const columns = 16;
    this.inventoryGrid = new GUI.Grid();
    this.inventoryWrapper = new GUI.Rectangle("inventoryWrapper");
    this.advancedTexture.addControl(this.inventoryWrapper);
    this.inventoryWrapper.addControl(this.inventoryGrid);
    this.inventoryWrapper.thickness = 0;
    this.inventoryWrapper.width = "90%";
    this.inventoryWrapper.height = "60%";
    this.inventoryWrapper.top = "-10%";
    this.inventoryGrid.width = "200%";
    this.inventoryGrid.left = "50%";
    for (let i = 0; i < rows; i++) {
      this.inventoryGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      this.inventoryGrid.addColumnDefinition(1 / columns);
    }
    this.inventoryWrapper.isVisible = false;
    this.inventoryGrid.clipChildren = false;
    this.inventoryGrid.clipContent = false;
    this.createInventoryCells();
  }
  private createInventoryCells(): void {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 16; col++) {
        const cell = GUI.Button.CreateSimpleButton(
          `but${row},${col}`,
          undefined
        );
        cell.color = "white";
        cell.background = "green";
        this.inventoryGrid.addControl(cell, row, col);
        this.inventoryCells.push(cell);
        cell.onPointerClickObservable.add((event) => {
          if (event.buttonIndex === 2) {
            this.showDropButton(
              cell,
              this.inventoryGrid,
              this.inventory,
              this.inventoryCells
            );
          }
          if (event.buttonIndex === 0) {
            this.dragItem(cell);
          }
        });
        cell.onPointerEnterObservable.add((event) => {
          if (!this.draggingItem) {
            this.showItemInfo(
              cell,
              this.inventoryGrid,
              this.inventoryCells,
              this.inventory
            );
          }
        });

        cell.onPointerOutObservable.add((event) => {
          this.disableTextBlock();
        });
      }
    }
  }

  private showItemInfo(
    cell: GUI.Button,
    grid: GUI.Grid,
    cellsArray: Array<GUI.Button>,
    meshArray: Array<AbstractMesh>
  ) {
    if (cell.textBlock.text != "") {
      const index = cellsArray.findIndex(
        (item) => item.uniqueId === cell.uniqueId
      );
      this.title.text = cell.textBlock.text;
      this.description.text = "Описание предмета";

      this.textBlock.leftInPixels =
        cell.transformedMeasure.left -
        grid.centerX +
        this.textBlock.widthInPixels;
      this.textBlock.topInPixels =
        cell.transformedMeasure.top - this.inventoryGrid.centerY;

      this.title.paddingBottomInPixels = 10;
      this.description.paddingTopInPixels = this.title.heightInPixels;
      this.textBlock.isVisible = true;
    } else return;
  }

  private dragItem(cell: GUI.Button) {
    if (this.draggingItem != cell) {
      const width = cell.widthInPixels;
      const height = cell.heightInPixels;
      this.draggingItem = cell;
      this.draggingItem.zIndex = 1;
      cell.widthInPixels = width;
      cell.heightInPixels = height;
      this.cursorPos.x = this.scene.pointerX;
      this.cursorPos.y = this.scene.pointerY;
      this.cellPos.x =
        cell.transformedMeasure.left -
        this.inventoryGrid.centerX +
        cell.transformedMeasure.width / 2;
      this.cellPos.y =
        cell.transformedMeasure.top -
        this.inventoryGrid.centerY +
        cell.transformedMeasure.height / 2;
      cell.leftInPixels = this.cursorPos.x - this.inventoryGrid.centerX;
      cell.topInPixels = this.cursorPos.y - this.inventoryGrid.centerY;

      this.draggingItem.isPointerBlocker = false;
    } else {
    }
  }

  private hadleDragging() {
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERUP) {
        if (this.draggingItem) {
          this.draggingItem.isPointerBlocker = true;
          this.draggingItem.leftInPixels = this.cellPos.x;
          this.draggingItem.topInPixels = this.cellPos.y;
          this.draggingItem.zIndex = 0;
          this.draggingItem = null;
        }
      } else if (
        event.type === PointerEventTypes.POINTERMOVE &&
        this.draggingItem
      ) {
        const deltaX = this.scene.pointerX - this.cursorPos.x;
        const deltaY = this.scene.pointerY - this.cursorPos.y;
        this.draggingItem.topInPixels += deltaY;
        this.draggingItem.leftInPixels += deltaX;
        this.cursorPos.x = this.scene.pointerX;
        this.cursorPos.y = this.scene.pointerY;
      }
    });
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
        cell.onPointerEnterObservable.add((event) => {
          if (!this.draggingItem) {
            this.showItemInfo(
              cell,
              this.quickAccessGrid,
              this.quickAccessCells,
              this.quickAccess
            );
          }
        });
        cell.onPointerOutObservable.add((event) => {
          this.disableTextBlock();
        });
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
      this.inventoryWrapper.isVisible = true;
      this.showSliderButtons();
    } else {
      this.engine.enterPointerlock();
      this.inventoryWrapper.isVisible = false;
      this.disableDropButton();
      this.hideSliderButtons();
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
  private disableTextBlock() {
    this.textBlock.isVisible = false;
  }
  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);

      this.showInventory();
    });
  }
  private createTextBlock() {
    this.textBlock = new GUI.Rectangle("textBlock");
    this.title = new GUI.TextBlock("title", undefined);
    this.title.resizeToFit = true;
    this.description = new GUI.TextBlock("description", undefined);
    this.description.resizeToFit = true;
    this.description.paddingTopInPixels = this.title.heightInPixels;
    this.textBlock.addControl(this.title);
    this.textBlock.addControl(this.description);
    this.textBlock.isVisible = false;
    this.textBlock.zIndex = 2;
    this.textBlock.background = "white";
    this.textBlock.clipChildren = false;
    this.textBlock.clipContent = false;
    this.textBlock.adaptHeightToChildren = true;
    this.textBlock.adaptWidthToChildren = true;
    this.advancedTexture.addControl(this.textBlock);
  }
  private createSliderButtons() {
    this.leftSliderButton = new GUI.Button("leftSliderButton");
    this.rightSliderButton = new GUI.Button("rightSliderButton");
    this.advancedTexture.addControl(this.leftSliderButton);
    this.advancedTexture.addControl(this.rightSliderButton);
    this.leftSliderButton.width = "5%";
    this.leftSliderButton.height = "5%";
    this.rightSliderButton.width = "5%";
    this.rightSliderButton.height = "5%";
    this.leftSliderButton.background = "black";
    this.rightSliderButton.background = "black";
    this.leftSliderButton.left = "-50%";
    this.rightSliderButton.left = "50%";
    this.rightSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(-50);
    });
    this.leftSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(50);
    });
    this.hideSliderButtons();
  }

  private slideInventar(value: number) {
    this.inventoryGrid.left = `${value}%`;
  }
  private hideSliderButtons() {
    this.leftSliderButton.isVisible = false;
    this.rightSliderButton.isVisible = false;
  }
  private showSliderButtons() {
    this.leftSliderButton.isVisible = true;
    this.rightSliderButton.isVisible = true;
  }
}
