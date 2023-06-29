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
import Root from "../../scene/root";
import HandActions from "../handActions";
import { ItemInfo, dragNdrop, DropItem } from "./commonUI";

export default class InventoryInteractions extends Inventory {
  private timeout: any;
  private interval: any;
  private info: ItemInfo;
  private dragNdrop: dragNdrop;
  private drop: DropItem;

  constructor(
    scene: Scene,
    engine: Engine,
    closedHand: AbstractMesh,
    hand: AbstractMesh
  ) {
    super(scene, engine, closedHand, hand);
    this.addEventListeners();
    this.inventoryEvents();
    this.info = new ItemInfo(entities.advancedTexture);
    this.dragNdrop = new dragNdrop(entities.advancedTexture, this.scene);
    this.drop = new DropItem();
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

  private addEventListeners() {
    entities.inventoryGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        this.dragNdrop.moveDraggingItem();
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.drop.disableDropButton(
            entities.inventoryGrid,
            entities.quickAccessGrid
          );
          this.drop.showDropButton(
            item,
            entities.inventoryGrid,
            this.inventory,
            entities.inventoryCells,
            this.deleteItem
          );
        }
        if (event.buttonIndex === 0 && this.dragNdrop.isDragItem) {
          const index = this.quickAccess.findIndex((item) => item?.isEnabled());
          if (
            index != -1 &&
            this.quickAccess[index] === this.dragNdrop.draggingMesh
          ) {
            this.dragNdrop.draggingMesh.setEnabled(false);
            HandActions.toggleHand(
              this.closedHand,
              this.hand,
              this.dragNdrop.draggingMesh
            );
          }
          this.dragNdrop.dropDruggingItem(
            item,
            this.inventory,
            entities.inventoryCells
          );
        } else if (
          event.buttonIndex === 0 &&
          !this.dragNdrop.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragNdrop.dragItem(item, this.inventory, entities.inventoryGrid);
        }
      });
      item.onPointerEnterObservable.add((event) => {
        this.info.showItemInfo(
          item,
          entities.inventoryWrapper,
          this.dragNdrop.isDragItem
        );
      });
      item.onPointerOutObservable.add((event) => {
        this.info.disableTextBlock();
      });
    });
    entities.quickAccessGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        this.dragNdrop.moveDraggingItem();
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.drop.showDropButton(
            item,
            entities.quickAccessGrid,
            this.quickAccess,
            entities.quickAccessCells,
            this.deleteItem
          );
        }
        if (event.buttonIndex === 0 && this.dragNdrop.isDragItem) {
          const index = this.quickAccess.findIndex((item) => item?.isEnabled());
          if (index != -1) {
            this.quickAccess[index].setEnabled(false);
          }
          this.dragNdrop.dropDruggingItem(
            item,
            this.quickAccess,
            entities.quickAccessCells
          );
          this.dragNdrop.draggingMesh.setEnabled(true);
          this.positionItem(this.dragNdrop.draggingMesh);
          HandActions.toggleHand(
            this.closedHand,
            this.hand,
            this.dragNdrop.draggingMesh
          );
        } else if (
          event.buttonIndex === 0 &&
          !this.dragNdrop.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragNdrop.dragItem(
            item,
            this.quickAccess,
            entities.inventoryGrid
          );
        }
      });
      item.onPointerEnterObservable.add((event) => {
        this.info.showItemInfo(
          item,
          entities.inventoryWrapper,
          this.dragNdrop.isDragItem
        );
      });
      item.onPointerOutObservable.add((event) => {
        this.info.disableTextBlock();
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
      this.showQuickAccess();
    } else if (!Root.usePointerLock) {
      this.engine.enterPointerlock();
      Root.usePointerLock = true;
      entities.inventoryWrapper.isVisible = false;
      entities.quickAccessGrid.isVisible = false;
      this.drop.disableDropButton(
        entities.inventoryGrid,
        entities.quickAccessGrid
      );
      this.hideSliderButtons();
    }
  }

  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);

      this.showInventory();
    });
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERMOVE) {
        this.dragNdrop.moveDraggingItem();
      }
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

  public toggleQuickAccessVisibility() {
    if (Root.usePointerLock) {
      entities.quickAccessGrid.isVisible = true;
      entities.quickAccessGrid.alpha = 1;
      clearInterval(this.interval);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.interval = setInterval(() => {
          entities.quickAccessGrid.alpha -= 0.2;
          if (entities.quickAccessGrid.alpha <= 0) {
            clearInterval(this.interval);
            clearTimeout(this.timeout);
            entities.quickAccessGrid.isVisible = false;
            entities.quickAccessGrid.alpha = 1;
          }
          console.log(entities.quickAccessGrid.alpha);
        }, 100);
      }, 2000);
    }
  }
  private showQuickAccess() {
    entities.quickAccessGrid.isVisible = true;
    entities.quickAccessGrid.alpha = 1;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }
}
