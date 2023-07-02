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
import * as GUI from "@babylonjs/gui";
import ControllEvents from "../characterControls";
import HandActions from "../handActions";
import QuickAccessUI from "./quickAccessUI";

export default class quickAccess {
  public quickAccess: Array<AbstractMesh>;
  protected id = 0;
  public UI: QuickAccessUI;
  constructor(
    protected scene: Scene,
    protected engine: Engine,
    protected closedHand: AbstractMesh,
    protected hand: AbstractMesh,
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents
  ) {
    this.quickAccess = Array(8).fill(undefined);
    this.UI = new QuickAccessUI(
      this.quickAccess,
      this.advancedTexture,
      this.controls,
      this.scene,
      this.hand,
      this.closedHand
    );
  }

  //функция удаления предмета из инвентаря
  public deleteFromQuickAccessAndFromHand(id: Number) {
    const index = this.quickAccess.findIndex((e) => e?.metadata.id === id);
    if (index != -1) {
      this.quickAccess[index].setEnabled(true);
      this.quickAccess[index] = undefined;
      this.deleteCell(index, this.UI.quickAccessCells);
      this.UI.correctStorage(this.quickAccess);
    } else return;
  }

  //функция добавления предмета в руку и в инвентарь
  public addInInventoryAndInHand(item: AbstractMesh) {
    if (!Object.keys(item.metadata).includes("id")) {
      item.metadata.id = this.id;
      this.id++;
    }
    if (this.quickAccess.length > 0) {
      this.quickAccess.forEach((item) => item?.setEnabled(false));
    }
    this.calcQuickAccess(item);
  }

  private calcQuickAccess(item: AbstractMesh) {
    this.calcArray(item, this.quickAccess);
    this.UI.correctStorage(this.quickAccess);
    this.UI.calcQuickAccessGrid(item);
  }

  //функция удаления ячейки инвентаря
  protected deleteCell(index: number, array: Array<GUI.Button>) {
    array[index].textBlock.text = "";
    array[index].image.source = "";
  }

  //функция расчет массива инвентаря
  private calcArray(item: AbstractMesh, array: Array<AbstractMesh>) {
    const index = array.findIndex((item) => item === undefined);
    if (index === -1) {
      array.push(item);
    } else {
      array[index] = item;
    }
  }

  public correctCurrentItem(): AbstractMesh {
    return this.quickAccess?.find((item) => item?.isEnabled());
  }
}
