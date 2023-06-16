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
    this.calcInventory(item);
    console.log(this.inventory);

    // this.addInventoryButton(this.row, this.col, item.name);
    // if (this.col < 6) {
    //   this.col++;
    // } else if (this.row < 8) {
    //   this.col = 0;
    //   this.row++;
    // }
  }

  public deleteFromInventory(id: Number) {
    const index = this.inventory.findIndex((e) => e.metadata.id === id);

    this.inventory[index].setEnabled(true);
    this.inventory[index] = undefined;
    this.deleteInventoryButton(index);
    // this.calcInventoryGrid();S
    console.log(this.inventory);
  }

  public addIntoInventoryWithHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    this.calcInventory(item);
    console.log(this.inventory);
    // this.addInventoryButton(this.row, this.col, item.name);
    // if (this.col < 6) {
    //   this.col++;
    // } else if (this.row < 8) {
    //   this.col = 0;
    //   this.row++;
    // }
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
      this.inventoryGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i <= columns; i++) {
      this.inventoryGrid.addColumnDefinition(1 / columns);
    }
    this.inventoryGrid.isVisible = false;

    // const displayGrid = new GUI.DisplayGrid();
    // displayGrid.width = "80%";
    // displayGrid.height = "80%";
    // this.inventoryGrid.addControl(displayGrid);
  }

  private addInventoryButton(row: number, col: number, name: string) {
    const button1 = GUI.Button.CreateSimpleButton(`but${row},${col}`, name);
    const container = this.inventoryGrid.addControl(button1, row, col);
    console.log(container);
    button1.color = "white";
    button1.background = "green";
    console.log(button1);
  }

  private deleteInventoryButton(id: number) {
    let row = 0;
    let col = 0;
    for (let i = 0; i < id; i++) {
      if (col < 6) {
        col++;
      } else if (row < 8) {
        col = 0;
        row++;
      }
    }
    const button = this.inventoryGrid.getChildByName(`but${row},${col}`);
    console.log(button);
    const container = this.inventoryGrid.removeControl(button);
    console.log(container);
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
  private calcInventory(item: AbstractMesh) {
    this.calcInventoryMass(item);
    this.calcInventoryGrid();
  }
  private calcInventoryMass(item: AbstractMesh) {
    const index = this.inventory.findIndex((item) => item === undefined);
    if (index === -1) {
      this.inventory.push(item);
    } else {
      this.inventory[index] = item;
    }
  }

  private calcInventoryGrid() {
    this.inventoryGrid.clearControls();
    let row = 0;
    let col = 0;
    this.inventory.forEach((item, index) => {
      this.addInventoryButton(row, col, item?.name);
      if (col < 6) {
        col++;
      } else if (row < 8) {
        col = 0;
        row++;
      }
    });
  }
}
