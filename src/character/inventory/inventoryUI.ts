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
import Root from "../../scene/root";
import DropItem from "./dropButton";
import ItemInfo from "./itemInfo";
import ControllEvents from "../characterControls";
import dragNdrop from "./dragNdrop";
import Instruments from "../instruments.ts/instruments";
import { inventoryItem } from "./inventory";
import Hands from "../hands";

export default class InventoryUI {
  private info: ItemInfo;
  private dragNdrop: dragNdrop;
  private drop: DropItem;
  public inventoryRows = 6;
  public inventoryColumns = 16;

  public rightSliderButton: GUI.Button;
  public leftSliderButton: GUI.Button;
  public inventoryWrapper: GUI.Rectangle;
  public inventoryGrid: GUI.Grid;
  public inventoryCells: Array<GUI.Button>;

  constructor(
    private inventory: Array<inventoryItem>,
    private scene: Scene,
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents,
    private engine: Engine,
    private hands: Hands,
    private instruments: Instruments
  ) {
    this.inventoryCells = [];
    this.createInventoryElements();
    this.addEventListeners();
    this.inventoryEvents();
    this.info = new ItemInfo(this.advancedTexture);
    this.dragNdrop = dragNdrop.Instance(this.advancedTexture, this.scene);
    this.drop = new DropItem(instruments);
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

  private addEventListeners() {
    this.inventoryGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        this.dragNdrop.moveDraggingItem();
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.drop.disableDropButton(this.inventoryGrid);
          this.drop.showDropButton(
            item,
            this.inventoryGrid,
            this.inventory,
            this.inventoryCells,
            this.hands
          );
        }
        //TODO:ДОДУМАТЬ ЛОГИКУ С ИС АКТИВЕ
        if (event.buttonIndex === 0 && this.dragNdrop.isDragItem) {
          this.dragNdrop.dropDruggingItem(
            item,
            this.inventory,
            this.inventoryCells
          );
        } else if (
          event.buttonIndex === 0 &&
          !this.dragNdrop.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragNdrop.dragItem(item, this.inventory);
        }
      });
      item.onPointerEnterObservable.add((event) => {
        this.info.showItemInfo(
          item,
          this.dragNdrop.isDragItem,
          this.instruments
        );
      });
      item.onPointerOutObservable.add((event) => {
        this.info.disableTextBlock();
      });
    });

    this.rightSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(-50);
    });
    this.leftSliderButton.onPointerClickObservable.add((event) => {
      this.slideInventar(50);
    });
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
      this.drop.disableDropButton(this.inventoryGrid);
      this.hideSliderButtons();
    }
  }

  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleInventoryEvents(event);
      this.showInventory();
    });
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERMOVE) {
        this.dragNdrop.moveDraggingItem();
      }
    });
  }

  //функция создания GUI сетки инвентаря
  private createInventoryGrid(): GUI.Grid {
    const rows = this.inventoryRows;
    const columns = this.inventoryColumns;
    const inventoryGrid = new GUI.Grid();

    inventoryGrid.width = "200%";
    inventoryGrid.left = "50%";
    for (let i = 0; i < rows; i++) {
      inventoryGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      inventoryGrid.addColumnDefinition(1 / columns);
    }
    inventoryGrid.clipChildren = false;
    inventoryGrid.clipContent = false;
    this.createInventoryCells(inventoryGrid);
    return inventoryGrid;
  }

  private createInventoryWrapper(): GUI.Rectangle {
    const inventoryWrapper = new GUI.Rectangle("inventoryWrapper");
    this.advancedTexture.addControl(inventoryWrapper);
    inventoryWrapper.addControl(this.inventoryGrid);
    inventoryWrapper.thickness = 0;
    inventoryWrapper.width = "90%";
    inventoryWrapper.height = "60%";
    inventoryWrapper.top = "-10%";
    inventoryWrapper.isVisible = false;
    return inventoryWrapper;
  }
  //создание ячеек инвентаря
  private createInventoryCells(grid: GUI.Grid): void {
    const rows = this.inventoryRows;
    const columns = this.inventoryColumns;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = GUI.Button.CreateImageWithCenterTextButton(
          `but${row},${col}`,
          undefined,
          undefined
        );
        cell.color = "white";
        cell.background = "green";
        grid.addControl(cell, row, col);
        this.inventoryCells.push(cell);
      }
    }
  }

  private createSliderButtons(): void {
    const leftSliderButton = new GUI.Button("leftSliderButton");
    const rightSliderButton = new GUI.Button("rightSliderButton");
    this.advancedTexture.addControl(leftSliderButton);
    this.advancedTexture.addControl(rightSliderButton);
    leftSliderButton.width = "5%";
    leftSliderButton.height = "5%";
    rightSliderButton.width = "5%";
    rightSliderButton.height = "5%";
    leftSliderButton.background = "black";
    rightSliderButton.background = "black";
    leftSliderButton.left = "-50%";
    rightSliderButton.left = "50%";
    leftSliderButton.isVisible = false;
    rightSliderButton.isVisible = false;
    this.leftSliderButton = leftSliderButton;
    this.rightSliderButton = rightSliderButton;
  }

  // private positionItem(item: AbstractMesh) {
  //   item.position.set(-0.11, 0.073, 0.028);
  //   item.rotationQuaternion = null;
  //   item.rotation.set(0, 0, 0);
  // }

  //функция расчета сетки инвентаря
  public calcInventoryGrid(item: any) {
    const emptyCellIndex = this.inventoryCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      this.inventoryCells[emptyCellIndex].textBlock.text = item.name;
      this.inventoryCells[emptyCellIndex].image.source = item.imageSrc;
      this.inventoryCells[emptyCellIndex].metadata = {
        id: item.id,
      };
    } else return;
  }

  //метод оболочка для метов создания элементов инвентаря
  private createInventoryElements() {
    this.inventoryGrid = this.createInventoryGrid();
    this.inventoryWrapper = this.createInventoryWrapper();
    this.createSliderButtons();
  }

  public correctStorage(array: Array<inventoryItem>) {
    this.inventory = array;
  }
}
