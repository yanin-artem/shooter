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
import HandActions from "../handActions";
import ItemInfo from "./itemInfo";
import ControllEvents from "../characterControls";
import dragNdrop from "./dragNdrop";
import DropItem from "./dropButton";
import { quickAccessItem } from "./quickAccess";
import { Instruments, instrument } from "../instruments.ts/instruments";
import Hands from "../hands";

export default class QuickAccessUI {
  public quickAccessCells: Array<GUI.Button>;
  public quickAccessGrid: GUI.Grid;
  public quickAccessRows = 1;
  public quickAccessColumns = 8;
  private timeout: any;
  private interval: any;
  private info: ItemInfo;
  private dragNdrop: dragNdrop;
  private drop: DropItem;

  constructor(
    private quickAccess: Array<quickAccessItem>,
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents,
    private scene: Scene,
    private hands: Hands,
    private instruments: Instruments
  ) {
    this.quickAccessCells = [];
    this.quickAccessGrid = this.createQuickAccessGrid();
    this.info = new ItemInfo(this.advancedTexture);
    this.dragNdrop = dragNdrop.Instance(advancedTexture, scene);
    this.drop = new DropItem(instruments);
    this.inventoryEvents();
    this.addEventListeners();
  }
  private addEventListeners() {
    this.quickAccessGrid.children.forEach((item: GUI.Button) => {
      item.onPointerMoveObservable.add((event) => {
        this.dragNdrop.moveDraggingItem();
      });
      item.onPointerClickObservable.add((event) => {
        if (event.buttonIndex === 2) {
          this.drop.showDropButton(
            item,
            this.quickAccessGrid,
            this.quickAccess,
            this.quickAccessCells,
            this.hands
          );
        }
        //УБРАТЬ ВСЮ ЛОГИКУ ВНУТРИ ОБРАБОТЧИКА В МЕТОД!!!
        if (event.buttonIndex === 0 && this.dragNdrop.isDragItem) {
          const enabledItem = this.quickAccess.find((item) => item.isEnabled);
          if (enabledItem) {
            const instrument = this.instruments.getByID(enabledItem.id);
            instrument.mesh.setEnabled(false);
            instrument.isActive = false;
          }
          this.dragNdrop.dropDruggingItem(
            item,
            this.quickAccess,
            this.quickAccessCells
          );
          const instrument = this.instruments.getByID(
            this.dragNdrop.draggingItem.id
          );
          instrument.isActive = true;
          const mesh = instrument.mesh;
          mesh.setEnabled(true);
          this.positionItem(mesh);
        } else if (
          event.buttonIndex === 0 &&
          !this.dragNdrop.isDragItem &&
          item.textBlock.text != ""
        ) {
          this.dragNdrop.dragItem(item, this.quickAccess);
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
  }
  //создание сетки панели быстрого доступа
  private createQuickAccessGrid() {
    const rows = this.quickAccessRows;
    const columns = this.quickAccessColumns;
    const quickAccessGrid = new GUI.Grid();
    this.advancedTexture.addControl(quickAccessGrid);
    quickAccessGrid.width = "90%";
    quickAccessGrid.height = "10%";
    quickAccessGrid.top = "35%";
    for (let i = 0; i < rows; i++) {
      quickAccessGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      quickAccessGrid.addColumnDefinition(1 / columns);
    }

    this.createQuickAccessCells(quickAccessGrid);
    quickAccessGrid.isVisible = false;
    return quickAccessGrid;
  }
  //создание ячеек панели быстрого доступа
  private createQuickAccessCells(grid: GUI.Grid) {
    const rows = this.quickAccessRows;
    const columns = this.quickAccessColumns;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = GUI.Button.CreateImageWithCenterTextButton(
          `but${row},${col}`,
          undefined,
          undefined
        );
        cell.color = "white";
        cell.background = "gray";
        cell.isPointerBlocker = true;
        grid.addControl(cell, row, col);
        this.quickAccessCells.push(cell);
      }
    }
  }

  public calcQuickAccessGrid(item: any) {
    const emptyCellIndex = this.quickAccessCells.findIndex(
      (item) => item.textBlock.text === ""
    );
    if (emptyCellIndex != -1) {
      this.quickAccessCells[emptyCellIndex].textBlock.text = item.name;
      this.quickAccessCells[emptyCellIndex].image.source = item.imageSrc;
      this.quickAccessCells[emptyCellIndex].metadata = {
        id: item.id,
      };
    } else {
      return;
    }
  }

  public toggleQuickAccessVisibility() {
    if (Root.usePointerLock) {
      this.quickAccessGrid.isVisible = true;
      this.quickAccessGrid.alpha = 1;
      clearInterval(this.interval);
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.interval = setInterval(() => {
          this.quickAccessGrid.alpha -= 0.2;
          if (this.quickAccessGrid.alpha <= 0) {
            clearInterval(this.interval);
            clearTimeout(this.timeout);
            this.quickAccessGrid.isVisible = false;
            this.quickAccessGrid.alpha = 1;
          }
          console.log(this.quickAccessGrid.alpha);
        }, 100);
      }, 2000);
    }
  }
  private showQuickAccess() {
    this.quickAccessGrid.isVisible = true;
    this.quickAccessGrid.alpha = 1;
    clearInterval(this.interval);
    clearTimeout(this.timeout);
  }
  private positionItem(item: AbstractMesh) {
    item.position.set(-0.11, 0.073, 0.028);
    item.rotationQuaternion = null;
    item.rotation.set(0, 0, 0);
  }

  //функция показать/убрать инвентарь
  private showInventory() {
    if (this.controls.showQuickAccess) {
      this.showQuickAccess();
      Root.usePointerLock = false;
    } else if (!Root.usePointerLock) {
      Root.usePointerLock = true;
      console.log("hello");
      this.quickAccessGrid.isVisible = false;
      this.drop.disableDropButton(this.quickAccessGrid);
    }
  }

  private inventoryEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleQuickAccessEvents(event);
      this.showInventory();
    });
    this.scene.onPointerObservable.add((event) => {
      if (event.type === PointerEventTypes.POINTERMOVE) {
        this.dragNdrop.moveDraggingItem();
      }
    });
  }

  public correctStorage(array: Array<quickAccessItem>) {
    this.quickAccess = array;
  }
}
