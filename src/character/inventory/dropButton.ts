import * as GUI from "@babylonjs/gui";
import { Inventory, inventoryItem } from "./inventory";
import { quickAccessItem } from "./quickAccess";
import { Instruments, instrument } from "../instruments.ts/instruments";

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
    dropCallBack
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
        this.deleteItem(cell.metadata.id, itemsArray, cellsArray, dropCallBack);
      });
    } else return;
  }

  //удаление предмета в интерфейсе инвентаря
  protected deleteItem(
    id: number,
    itemsArray: Array<any>,
    cellsArray: Array<GUI.Button>,
    dropCallBack
    //onDelete()
  ) {
    const index = itemsArray.findIndex((e) => e.id === id);
    if (index != -1) {
      const item = this.instruments.getByID(id);
      itemsArray[index].id = -1;
      if (Object.keys(itemsArray).includes("isEnabled"))
        itemsArray[index].isEnabled = true;
      item.mesh.setEnabled(true);
      dropCallBack(item.mesh);
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
