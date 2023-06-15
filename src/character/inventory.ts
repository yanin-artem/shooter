import { AbstractMesh, Engine, Mesh, Scene } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
import ControllEvents from "./characterControls";

export default class Inventory {
  public inventory: Array<AbstractMesh>;
  private id = 0;
  private controls: ControllEvents;
  private inventoryGrid: GUI.Grid;
  //TODO: переделать и все с этим связанное!!!
  private row = 0;
  private col = 0;
  constructor(private scene: Scene, private engine: Engine) {
    this.inventory = [];
    this.controls = new ControllEvents();
    this.createGrid();
    this.showInventory();
  }
  public addIntoInventory(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.setEnabled(false);
    this.inventory.push(item);
    this.addInventoryButton(this.row, this.col, item.name);
    if (this.col < 6) {
      this.col++;
    } else if (this.row < 8) {
      this.col = 0;
      this.row++;
    }
  }

  public deleteFromInventory(id: Number) {
    const index = this.inventory.findIndex((e) => e.metadata.id === id);

    this.inventory[index].setEnabled(true);
    this.inventory.splice(index, 1);
    this.deleteInventoryButton(this.row, this.col);
  }

  public addIntoInventoryWithHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    this.inventory.push(item);
    this.addInventoryButton(this.row, this.col, item.name);
    if (this.col < 6) {
      this.col++;
    } else if (this.row < 8) {
      this.col = 0;
      this.row++;
    }
  }

  private createGrid() {
    const rows = 8;
    const columns = 6;
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    this.inventoryGrid = new GUI.Grid();
    advancedTexture.addControl(this.inventoryGrid);
    this.inventoryGrid.width = "80%";
    this.inventoryGrid.height = "80%";
    for (let i = 0; i <= rows; i++) {
      this.inventoryGrid.addRowDefinition(0.125);
    }
    for (let i = 0; i <= columns; i++) {
      this.inventoryGrid.addColumnDefinition(0.166);
    }
    this.inventoryGrid.isVisible = false;

    // const displayGrid = new GUI.DisplayGrid();
    // displayGrid.width = "80%";
    // displayGrid.height = "80%";
    // this.inventoryGrid.addControl(displayGrid);
  }

  private addInventoryButton(row: number, col: number, name: string) {
    const button1 = GUI.Button.CreateSimpleButton(`but${row},${col}`, name);
    this.inventoryGrid.addControl(button1, row, col);
    button1.color = "white";
    button1.background = "green";
  }

  private deleteInventoryButton(row: number, col: number) {
    const button = this.inventoryGrid.getChildByName(`but${row},${col - 1}`);
    this.inventoryGrid.removeControl(button);
  }

  private showInventory() {
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      if (this.controls.showInventar) {
        this.engine.exitPointerlock();
        this.inventoryGrid.isVisible = true;
      } else {
        this.engine.enterPointerlock();
        this.inventoryGrid.isVisible = false;
      }
    });
  }
}
