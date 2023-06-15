import { AbstractMesh, Mesh } from "@babylonjs/core";

export default class Inventar {
  public inventar: Array<AbstractMesh>;
  private id = 0;
  constructor() {
    this.inventar = [];
  }
  public addIntoInventar(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    item.setEnabled(false);
    this.inventar.push(item);
  }

  public deleteFromInventar(id: Number) {
    const index = this.inventar.findIndex((e) => e.metadata.id === id);
    console.log(index, id);

    this.inventar[index].setEnabled(true);
    this.inventar.splice(index, 1);
  }
}
