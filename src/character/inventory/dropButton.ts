import * as GUI from "@babylonjs/gui";
import { Inventory, inventoryItem } from "./inventory";
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
import { quickAccessItem } from "./quickAccess";
import Instruments from "../instruments.ts/instruments";
import Hands from "../hands";

export default class DropItem {
  public dropButton: GUI.Button;
  constructor(private instruments: Instruments) {
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
    itemsArray: Array<quickAccessItem> | Array<inventoryItem>,
    cellsArray: Array<GUI.Button>,
    hands: Hands
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
        this.deleteItem(cell.metadata.id, itemsArray, cellsArray, hands);
      });
    } else return;
  }

  //удаление предмета в интерфейсе инвентаря
  protected deleteItem(
    id: number,
    itemsArray: Array<any>,
    cellsArray: Array<GUI.Button>,
    hands: Hands
  ) {
    const index = itemsArray.findIndex((e) => e.id === id);
    if (index != -1) {
      const mesh = this.instruments.getById(id).mesh;
      itemsArray[index].id = -1;
      if (Object.keys(itemsArray).includes("isEnabled"))
        itemsArray[index].isEnabled = true;
      mesh.setEnabled(true);
      //TODO:ипсправить
      mesh.setParent(null);
      mesh.physicsImpostor = new PhysicsImpostor(
        mesh,
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1 }
      );
      this.deleteCell(index, cellsArray);
    } else return;
  }

  //функция удаления ячейки инвентаря
  protected deleteCell(index: number, array: Array<GUI.Button>) {
    console.log(array[index]);
    array[index].textBlock.text = "";
    array[index].image.source = "";
  }
}
