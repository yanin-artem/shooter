//DRAG N DROP CLASS
import * as GUI from "@babylonjs/gui";
import { Scene, Vector2 } from "@babylonjs/core";
import { inventoryItem } from "./inventory";
import { quickAccessItem } from "./quickAccess";
import { Instruments } from "../instruments.ts/instruments";

export default class dragNdrop {
  private draggingCell: GUI.Button;
  private originMeshArray: Array<quickAccessItem | inventoryItem>;
  private draggingMeshIndex = 0;
  private cursorPos: Vector2;
  private dragImpostor: GUI.Button;
  public isDragItem = false;
  private static instance: dragNdrop;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private scene: Scene;

  private constructor() {
    this.cursorPos = Vector2.Zero();
  }
  public dragItem(cell: GUI.Button, itemsArray: Array<any>) {
    if (!this.isDragItem) {
      this.copyCellProperties(this.dragImpostor, cell);
      const index = itemsArray.findIndex(
        (item) => item.id === cell.metadata.id
      );
      this.draggingMeshIndex = index;
      this.originMeshArray = itemsArray;
      this.draggingCell = cell;
      this.draggingCell.metadata = cell.metadata;
      this.cursorPos.x = this.scene.pointerX;
      this.cursorPos.y = this.scene.pointerY;
      this.clearCell(cell);
      this.dragImpostor.isVisible = true;
      this.isDragItem = true;
      this.dragItemPosition();
    }
  }

  public dropDruggingItem(
    cell: GUI.Button,
    itemsArray: Array<quickAccessItem> | Array<inventoryItem>,
    cellsArray: Array<GUI.Button>,
    instruments: Instruments
  ) {
    this.switchCells(this.draggingCell, cell);
    this.switchArrayItems(
      this.originMeshArray,
      itemsArray,
      cellsArray,
      instruments
    );
    this.dragImpostor.isVisible = false;
    this.isDragItem = false;
  }

  private switchCells(originCell: GUI.Button, currentCell: GUI.Button) {
    originCell.image.source = currentCell.image.source;
    originCell.textBlock.text = currentCell.textBlock.text;
    originCell.metadata = currentCell.metadata;
    currentCell.metadata = this.dragImpostor.metadata;
    currentCell.image.source = this.dragImpostor.image.source;
    currentCell.textBlock.text = this.dragImpostor.textBlock.text;
  }

  private switchArrayItems(
    originItemsArray: any,
    currentItemsArray: any,
    currentCellsArray: Array<GUI.Button>,
    instruments: Instruments
  ) {
    console.log(this.originMeshArray);

    let meshIndex = currentCellsArray.findIndex(
      (item) => item.metadata?.id === this.dragImpostor.metadata.id
    );
    console.log(this.originMeshArray);

    const bufferId = originItemsArray[this.draggingMeshIndex].id;
    this.toggleIsActive(originItemsArray, this.draggingMeshIndex, instruments);
    originItemsArray[this.draggingMeshIndex].id =
      currentItemsArray[meshIndex].id;
    currentItemsArray[meshIndex].id = bufferId;
    this.toggleIsActive(currentItemsArray, meshIndex, instruments);
  }

  private toggleIsActive(
    array: Array<any>,
    index: number,
    instruments: Instruments
  ) {
    const item = instruments.getByID(array[index].id);
    if (array[index]?.isEnabled != undefined) {
      array[index].isEnabled = !array[index].isEnabled;
      item.isActive = !item.isActive;
      item.mesh.setEnabled(item.isActive);
    } else {
      item.isActive = false;
      item.mesh.setEnabled(false);
    }
  }

  private dragItemPosition() {
    this.dragImpostor.leftInPixels =
      this.cursorPos.x - document.body.clientWidth / 2;
    this.dragImpostor.topInPixels =
      this.cursorPos.y - document.body.clientHeight / 2;
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

  public static Instance(
    advancedTexture: GUI.AdvancedDynamicTexture,
    scene: Scene
  ) {
    if (this.instance) return this.instance;
    else {
      this.instance = new this();
      this.instance.advancedTexture = advancedTexture;
      this.instance.scene = scene;
      this.instance.createDragImpostor();
      return this.instance;
    }
  }

  private copyCellProperties(dragImpostor: GUI.Button, cell: GUI.Button) {
    dragImpostor.background = cell.background;
    dragImpostor.textBlock.text = cell.textBlock.text;
    dragImpostor.metadata = { id: cell.metadata.id };
    dragImpostor.image.source = cell.image.source;
    dragImpostor.widthInPixels = cell.widthInPixels;
    dragImpostor.heightInPixels = cell.heightInPixels;
  }

  private createDragImpostor() {
    this.dragImpostor = GUI.Button.CreateImageWithCenterTextButton(
      undefined,
      undefined,
      undefined
    );
    this.advancedTexture.addControl(this.dragImpostor);
    this.dragImpostor.isVisible = false;
    this.dragImpostor.isPointerBlocker = false;
    this.dragImpostor.isHitTestVisible = false;
    this.dragImpostor.zIndex = 3;
  }

  private clearCell(cell: GUI.Button) {
    cell.image.source = "";
    cell.textBlock.text = "";
  }
}
