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
import { inventoryEntities as entities } from "./inventoryEntities";
import Inventory from "./inventory";
import Root from "../scene/root";
import HandActions from "./handActions";

export default class InventoryInteractions extends Inventory {
  private cursorPos: Vector2;
  private dragImpostor: GUI.Button;
  private isDragItem = false;
  private draggingMesh: AbstractMesh;
  private draggingCell: GUI.Button;
  private originMeshArray: Array<AbstractMesh>;
  private draggingMeshIndex = 0;

  constructor(
    scene: Scene,
    engine: Engine,
    closedHand: AbstractMesh,
    hand: AbstractMesh
  ) {
    super(scene, engine, closedHand, hand);
    this.cursorPos = Vector2.Zero();
    this.hadleDragging();
    this.addEventListeners();
    this.inventoryEvents();
  }
  public showItemInfo(cell: GUI.Button, grid: GUI.Rectangle) {
    if (cell.textBlock.text != "") {
      entities.title.text = cell.textBlock.text;
      entities.description.text = "Описание предмета";
      this.itemInfoPosition(cell, grid);
      entities.textBlock.isVisible = true;
    } else return;
  }

  private itemInfoPosition(cell: GUI.Button, grid: GUI.Rectangle) {
    entities.textBlock.leftInPixels =
      cell.transformedMeasure.left -
      grid.centerX +
      entities.textBlock.widthInPixels;
    entities.textBlock.topInPixels =
      cell.transformedMeasure.top - entities.inventoryGrid.centerY;

    entities.title.paddingBottomInPixels = 10;
    entities.description.paddingTopInPixels = entities.title.heightInPixels;
  }

  public disableTextBlock() {
    entities.textBlock.isVisible = false;
  }
  private dragItem(cell: GUI.Button, meshArray: Array<AbstractMesh>) {
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
      entities.advancedTexture.addControl(this.dragImpostor);
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
      this.dragItemPosition(cell);
    }
  }

  private dropDruggingItem(
    cell: GUI.Button,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    this.switchItems(cell, meshArray, cellsArray);
    this.isDragItem = false;
    entities.advancedTexture.removeControl(this.dragImpostor);
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

  private hadleDragging() {
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERMOVE && this.isDragItem) {
        const deltaX = this.scene.pointerX - this.cursorPos.x;
        const deltaY = this.scene.pointerY - this.cursorPos.y;
        this.dragImpostor.topInPixels += deltaY;
        this.dragImpostor.leftInPixels += deltaX;
        this.cursorPos.x = this.scene.pointerX;
        this.cursorPos.y = this.scene.pointerY;
      }
    });
  }

  private dragItemPosition(cell: GUI.Button) {
    this.dragImpostor.leftInPixels =
      this.cursorPos.x - document.body.clientWidth / 2;
    this.dragImpostor.topInPixels =
      this.cursorPos.y -
      entities.inventoryGrid.heightInPixels +
      this.dragImpostor.heightInPixels;
  }

  private slideInventar(value: number) {
    entities.inventoryGrid.left = `${value}%`;
  }
  private hideSliderButtons() {
    entities.leftSliderButton.isVisible = false;
    entities.rightSliderButton.isVisible = false;
  }
  private showSliderButtons() {
    entities.leftSliderButton.isVisible = true;
    entities.rightSliderButton.isVisible = true;
  }

  private showDropButton(
    cell: GUI.Button,
    grid: GUI.Grid,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>
  ) {
    this.disableDropButton();
    if (cell.textBlock.text != "") {
      entities.dropButton.onPointerClickObservable.clear();
      const cellCoordinates = grid.getChildCellInfo(cell).split(":");
      grid.addControl(
        entities.dropButton,
        +cellCoordinates[0],
        +cellCoordinates[1]
      );
      entities.dropButton.onPointerClickObservable.addOnce(() => {
        this.deleteItem(cell.metadata.id, meshArray, cellsArray);
      });
    } else return;
  }

  private addEventListeners() {
    entities.inventoryGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        if (this.isDragItem) {
          const deltaX = this.scene.pointerX - this.cursorPos.x;
          const deltaY = this.scene.pointerY - this.cursorPos.y;
          this.dragImpostor.topInPixels += deltaY;
          this.dragImpostor.leftInPixels += deltaX;
          this.cursorPos.x = this.scene.pointerX;
          this.cursorPos.y = this.scene.pointerY;
        }
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.showDropButton(
            item,
            entities.inventoryGrid,
            this.inventory,
            entities.inventoryCells
          );
        }
        if (event.buttonIndex === 0 && this.isDragItem) {
          const index = this.quickAccess.findIndex((item) => item?.isEnabled());
          if (index != -1 && this.quickAccess[index] === this.draggingMesh) {
            this.draggingMesh.setEnabled(false);
            HandActions.toggleHand(
              this.closedHand,
              this.hand,
              this.draggingMesh
            );
          }
          this.dropDruggingItem(item, this.inventory, entities.inventoryCells);
        } else if (
          event.buttonIndex === 0 &&
          !this.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragItem(item, this.inventory);
        }
      });
      item.onPointerEnterObservable.add((event) => {
        if (!this.isDragItem) {
          this.showItemInfo(item, entities.inventoryWrapper);
        }
      });
      item.onPointerOutObservable.add((event) => {
        this.disableTextBlock();
      });
    });
    entities.quickAccessGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        if (this.isDragItem) {
          const deltaX = this.scene.pointerX - this.cursorPos.x;
          const deltaY = this.scene.pointerY - this.cursorPos.y;
          this.dragImpostor.topInPixels += deltaY;
          this.dragImpostor.leftInPixels += deltaX;
          this.cursorPos.x = this.scene.pointerX;
          this.cursorPos.y = this.scene.pointerY;
        }
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.showDropButton(
            item,
            entities.quickAccessGrid,
            this.quickAccess,
            entities.quickAccessCells
          );
        }
        if (event.buttonIndex === 0 && this.isDragItem) {
          const index = this.quickAccess.findIndex((item) => item?.isEnabled());
          if (index != -1) {
            this.quickAccess[index].setEnabled(false);
          }
          this.dropDruggingItem(
            item,
            this.quickAccess,
            entities.quickAccessCells
          );
          this.draggingMesh.setEnabled(true);
          this.positionItem(this.draggingMesh);
          HandActions.toggleHand(this.closedHand, this.hand, this.draggingMesh);
        } else if (
          event.buttonIndex === 0 &&
          !this.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragItem(item, this.quickAccess);
        }
      });
      item.onPointerEnterObservable.add((event) => {
        if (!this.isDragItem) {
          this.showItemInfo(item, entities.inventoryWrapper);
        }
      });
      item.onPointerOutObservable.add((event) => {
        this.disableTextBlock();
      });
    });

    entities.rightSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(-50);
    });
    entities.leftSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(50);
    });
  }

  //функция показать/убрать инвентарь
  private showInventory() {
    if (this.controls.showInventar) {
      this.engine.exitPointerlock();
      Root.usePointerLock = false;
      entities.inventoryWrapper.isVisible = true;
      this.showSliderButtons();
    } else {
      this.engine.enterPointerlock();
      Root.usePointerLock = true;
      entities.inventoryWrapper.isVisible = false;
      this.disableDropButton();
      this.hideSliderButtons();
    }
  }

  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);

      this.showInventory();
    });
  }

  public correctCurrentItem(): AbstractMesh {
    return this.quickAccess.find((item) => item?.isEnabled());
  }

  private positionItem(item: AbstractMesh) {
    item.position.set(-0.11, 0.073, 0.028);
    item.rotationQuaternion = null;
    item.rotation.set(0, 0, 0);
  }
}
