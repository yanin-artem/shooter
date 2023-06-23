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

export default class InventoryInteractions {
  private cursorPos: Vector2;
  private cellPos: Vector2;

  constructor(
    private scene: Scene,
    private title: GUI.TextBlock,
    private description: GUI.TextBlock,
    private textBlock: GUI.Rectangle,
    private draggingItem: GUI.Button,
    private inventoryGrid: GUI.Grid,
    private rightSliderButton: GUI.Button,
    private leftSliderButton: GUI.Button
  ) {
    this.cursorPos = Vector2.Zero();
    this.cellPos = Vector2.Zero();
    this.hadleDragging();
  }
  public showItemInfo(cell: GUI.Button, grid: GUI.Rectangle) {
    if (cell.textBlock.text != "") {
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
    this.textBlock.topInPixels =
      cell.transformedMeasure.top - this.inventoryGrid.centerY;

    this.title.paddingBottomInPixels = 10;
    this.description.paddingTopInPixels = this.title.heightInPixels;
  }

  public disableTextBlock() {
    this.textBlock.isVisible = false;
  }
  //FIXME: спросить про драг н дроп, как получить кнопку под кнопкой создать обьект
  public dragItem(cell: GUI.Button) {
    if (this.draggingItem != cell) {
      const width = cell.widthInPixels;
      const height = cell.heightInPixels;
      this.draggingItem = cell;
      this.draggingItem.zIndex = 1;
      cell.widthInPixels = width;
      cell.heightInPixels = height;
      this.cursorPos.x = this.scene.pointerX;
      this.cursorPos.y = this.scene.pointerY;
      this.dragItemPosition(cell);
      this.draggingItem.isPointerBlocker = false;
      // this.draggingItem.isHitTestVisible = false;
    } else {
    }
  }

  public hadleDragging() {
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

  private dragItemPosition(cell: GUI.Button) {
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
  }

  public slideInventar(value: number) {
    this.inventoryGrid.left = `${value}%`;
  }
  public hideSliderButtons() {
    this.leftSliderButton.isVisible = false;
    this.rightSliderButton.isVisible = false;
  }
  public showSliderButtons() {
    this.leftSliderButton.isVisible = true;
    this.rightSliderButton.isVisible = true;
  }
}
