import { AbstractMesh, Mesh } from "@babylonjs/core";

export default class Inventory {
  public inventory: Array<AbstractMesh>;
  private id = 0;
  constructor() {
    this.inventory = [];
  }
  public addIntoInventar(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.setEnabled(false);
    this.inventory.push(item);
    console.log(this.inventory);
  }

  public deleteFromInventar(id: Number) {
    const index = this.inventory.findIndex((e) => e.metadata.id === id);

    this.inventory[index].setEnabled(true);
    this.inventory.splice(index, 1);
  }

  public addIntoInventarWithHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    this.inventory.push(item);
    console.log(this.inventory);
  }
}
