import * as GUI from "@babylonjs/gui";
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
import Inventory from "./inventory";
//SHOW ITEM INFO CLASS
export class ItemInfo {
  public textBlock: GUI.Rectangle;
  public title: GUI.TextBlock;
  public description: GUI.TextBlock;
  public draggingItem: GUI.Button;

  constructor(private advancedTexture: GUI.AdvancedDynamicTexture) {
    this.title = this.createTextBlockTitle();
    this.description = this.createTextBlockDescription();
    this.textBlock = this.createTextBlock();
  }
  private createTextBlock(): GUI.Rectangle {
    const textBlock = new GUI.Rectangle("textBlock");

    textBlock.addControl(this.title);
    textBlock.addControl(this.description);
    textBlock.isVisible = false;
    textBlock.zIndex = 2;
    textBlock.background = "white";
    textBlock.clipChildren = false;
    textBlock.clipContent = false;
    textBlock.adaptHeightToChildren = true;
    textBlock.adaptWidthToChildren = true;
    this.advancedTexture.addControl(textBlock);
    return textBlock;
  }

  private createTextBlockTitle(): GUI.TextBlock {
    const title = new GUI.TextBlock("title", undefined);
    title.resizeToFit = true;
    return title;
  }
  private createTextBlockDescription(): GUI.TextBlock {
    const description = new GUI.TextBlock("description", undefined);
    description.resizeToFit = true;
    description.paddingTopInPixels = this.title.heightInPixels;
    return description;
  }

  public showItemInfo(
    cell: GUI.Button,
    grid: GUI.Rectangle,
    isDragItem: boolean
  ) {
    if (cell.textBlock.text != "" && !isDragItem) {
      this.title.text = cell.textBlock.text;
      this.description.text = "Описание предмета";
      this.itemInfoPosition(cell, grid);
      this.textBlock.isVisible = true;
    } else return;
  }

  private itemInfoPosition(cell: GUI.Button, grid: GUI.Rectangle) {
    this.textBlock.leftInPixels =
      cell.transformedMeasure.left -
      grid.centerX +
      this.textBlock.widthInPixels;
    this.textBlock.topInPixels = cell.transformedMeasure.top - grid.centerY;

    this.title.paddingBottomInPixels = 10;
    this.description.paddingTopInPixels = this.title.heightInPixels;
  }

  public disableTextBlock() {
    this.textBlock.isVisible = false;
  }
}

//DRAG N DROP CLASS
export class dragNdrop {
  private draggingCell: GUI.Button;
  private originMeshArray: Array<AbstractMesh>;
  private draggingMeshIndex = 0;
  private cursorPos: Vector2;
  private dragImpostor: GUI.Button;
  public isDragItem = false;
  public draggingMesh: AbstractMesh;
  constructor(
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private scene: Scene
  ) {
    this.cursorPos = Vector2.Zero();
  }
  public dragItem(
    cell: GUI.Button,
    meshArray: Array<AbstractMesh>,
    grid: GUI.Grid
  ) {
    if (!this.isDragItem) {
      const width = cell.widthInPixels;
      const height = cell.heightInPixels;
      this.dragImpostor = cell.clone(cell.host) as GUI.Button;
      this.dragImpostor.metadata = { id: cell.metadata.id };
      const index = meshArray.findIndex(
        (item) => item?.metadata.id === cell.metadata.id
      );
      this.draggingMeshIndex = index;
      this.draggingMesh = meshArray[index];
      this.originMeshArray = meshArray;
      this.advancedTexture.addControl(this.dragImpostor);
      this.isDragItem = true;
      this.dragImpostor.widthInPixels = width;
      this.dragImpostor.heightInPixels = height;
      this.dragImpostor.isPointerBlocker = false;
      this.dragImpostor.isHitTestVisible = false;
      this.cursorPos.x = this.scene.pointerX;
      this.cursorPos.y = this.scene.pointerY;
      this.draggingCell = cell;
      cell.image.source = "";
      cell.textBlock.text = "";
      cell.metadata.id = null;
      this.dragItemPosition(grid);
    }
  }

  public dropDruggingItem(
    cell: GUI.Button,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    this.switchItems(cell, meshArray, cellsArray);
    this.isDragItem = false;
    this.advancedTexture.removeControl(this.dragImpostor);
    this.dragImpostor.dispose();
  }

  private switchItems(
    cell: GUI.Button,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    this.draggingCell.image.source = cell.image.source;
    this.draggingCell.textBlock.text = cell.textBlock.text;
    this.draggingCell.metadata = cell.metadata;
    cell.image.source = this.dragImpostor.image.source;
    cell.textBlock.text = this.dragImpostor.textBlock.text;
    cell.metadata = { id: this.dragImpostor.metadata.id };
    let meshIndex = cellsArray.findIndex(
      (item) => item.metadata?.id === this.dragImpostor.metadata.id
    );
    this.originMeshArray[this.draggingMeshIndex] = meshArray[meshIndex];
    meshArray[meshIndex] = this.draggingMesh;
  }

  private dragItemPosition(grid: GUI.Grid) {
    this.dragImpostor.leftInPixels =
      this.cursorPos.x - document.body.clientWidth / 2;
    this.dragImpostor.topInPixels =
      this.cursorPos.y - grid.heightInPixels + this.dragImpostor.heightInPixels;
  }

  public moveDraggingItem() {
    if (this.isDragItem) {
      const deltaX = this.scene.pointerX - this.cursorPos.x;
      const deltaY = this.scene.pointerY - this.cursorPos.y;
      this.dragImpostor.topInPixels += deltaY;
      this.dragImpostor.leftInPixels += deltaX;
      this.cursorPos.x = this.scene.pointerX;
      this.cursorPos.y = this.scene.pointerY;
    }
  }
}

//DROP BUTTON
export class DropItem {
  public dropButton: GUI.Button;
  constructor() {
    this.dropButton = this.createDropButton();
  }

  private createDropButton(): GUI.Button {
    const dropButton = GUI.Button.CreateSimpleButton("drop", "выбросить");
    dropButton.color = "white";
    dropButton.background = "black";
    dropButton.height = "40%";
    return dropButton;
  }

  public disableDropButton(inventoryGrid: GUI.Grid, quickAccessGrid: GUI.Grid) {
    if (inventoryGrid.getChildByName(this.dropButton.name)) {
      inventoryGrid.removeControl(this.dropButton);
    } else if (quickAccessGrid.getChildByName(this.dropButton.name)) {
      quickAccessGrid.removeControl(this.dropButton);
    }
  }

  public showDropButton(
    cell: GUI.Button,
    grid: GUI.Grid,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>,
    deleteItem
  ) {
    if (cell.textBlock.text != "") {
      this.dropButton.onPointerClickObservable.clear();
      const cellCoordinates = grid.getChildCellInfo(cell).split(":");
      grid.addControl(
        this.dropButton,
        +cellCoordinates[0],
        +cellCoordinates[1]
      );
      this.dropButton.onPointerClickObservable.addOnce(() => {
        deleteItem.call(Inventory, cell.metadata.id, meshArray, cellsArray);
      });
    } else return;
  }
}
