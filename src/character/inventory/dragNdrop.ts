//DRAG N DROP CLASS
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
import { Inventory, inventoryItem } from "./inventory";
import { quickAccessItem } from "./quickAccess";

export default class dragNdrop {
  private draggingCell: GUI.Button;
  private originMeshArray: Array<quickAccessItem | inventoryItem>;
  private draggingMeshIndex = 0;
  private cursorPos: Vector2;
  private dragImpostor: GUI.Button;
  public isDragItem = false;
  public draggingItem: quickAccessItem | inventoryItem;
  private static instance: dragNdrop;
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private scene: Scene;

  private constructor() {
    this.cursorPos = Vector2.Zero();
  }
  public dragItem(
    cell: GUI.Button,
    itemsArray: Array<quickAccessItem | inventoryItem>
  ) {
    console.log(itemsArray);
    if (!this.isDragItem) {
      const width = cell.widthInPixels;
      const height = cell.heightInPixels;
      this.dragImpostor = cell.clone(cell.host) as GUI.Button;
      this.dragImpostor.metadata = { id: cell.metadata.id };
      const index = itemsArray.findIndex(
        (item) => item.id === cell.metadata.id
      );
      this.draggingMeshIndex = index;
      this.draggingItem = itemsArray[index];
      this.originMeshArray = itemsArray;
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
      this.dragItemPosition();
    }
  }

  public dropDruggingItem(
    cell: GUI.Button,
    itemsArray: Array<quickAccessItem | inventoryItem>,
    cellsArray: Array<GUI.Button>
  ) {
    this.switchItems(cell, itemsArray, cellsArray);
    this.isDragItem = false;
    this.advancedTexture.removeControl(this.dragImpostor);
    this.dragImpostor.dispose();
  }

  private switchItems(
    cell: GUI.Button,
    itemsArray: Array<quickAccessItem | inventoryItem>,
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
    this.originMeshArray[this.draggingMeshIndex] = itemsArray[meshIndex];
    itemsArray[meshIndex] = this.draggingItem;
  }

  private dragItemPosition() {
    this.dragImpostor.leftInPixels =
      this.cursorPos.x - document.body.clientWidth / 2;
    this.dragImpostor.topInPixels =
      this.cursorPos.y - document.body.clientHeight / 2;
    console.log(document.body.clientHeight);
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
      return this.instance;
    }
  }
}
