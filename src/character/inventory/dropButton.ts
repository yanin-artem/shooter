import * as GUI from "@babylonjs/gui";
import Inventory from "./inventory";
import HandActions from "../handActions";
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

export default class DropItem {
  public dropButton: GUI.Button;
  constructor() {
    this.dropButton = this.createDropButton();
  }

  private createDropButton(): GUI.Button {
    const dropButton = GUI.Button.CreateSimpleButton("drop", "выбросить");
    dropButton.color = "white";
    dropButton.background = "black";
    dropButton.height = "40%";
    return dropButton;
  }

  public disableDropButton(grid: GUI.Grid) {
    if (grid.getChildByName(this.dropButton.name)) {
      grid.removeControl(this.dropButton);
    }
  }
  //InventoryPanel в ней сетка и тд
  public showDropButton(
    cell: GUI.Button,
    grid: GUI.Grid,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>,
    hand: AbstractMesh,
    closedHand: AbstractMesh
  ) {
    if (cell.textBlock.text != "") {
      this.dropButton.onPointerClickObservable.clear();
      const cellCoordinates = grid.getChildCellInfo(cell).split(":");
      grid.addControl(
        this.dropButton,
        +cellCoordinates[0],
        +cellCoordinates[1]
      );
      this.dropButton.onPointerClickObservable.addOnce(() => {
        this.deleteItem(
          cell.metadata.id,
          meshArray,
          cellsArray,
          hand,
          closedHand
        );
      });
    } else return;
  }

  //удаление предмета в интерфейсе инвентаря
  protected deleteItem(
    id: Number,
    meshArray: Array<AbstractMesh>,
    cellsArray: Array<GUI.Button>,
    hand: AbstractMesh,
    closedHand: AbstractMesh
  ) {
    const index = meshArray.findIndex((e) => e?.metadata.id === id);
    if (index != -1) {
      meshArray[index].setEnabled(true);
      closedHand.removeChild(meshArray[index]);
      meshArray[index].physicsImpostor = new PhysicsImpostor(
        meshArray[index],
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1 }
      );
      meshArray[index] = undefined;
      HandActions.toggleHand(closedHand, hand, meshArray[index]);
      this.deleteCell(index, cellsArray);
    } else return;
  }

  //функция удаления ячейки инвентаря
  protected deleteCell(index: number, array: Array<GUI.Button>) {
    array[index].textBlock.text = "";
    array[index].image.source = "";
  }
}
