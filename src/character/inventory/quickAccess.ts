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
import QuickAccessUI from "./quickAccessUI";
import { Instruments, instrument } from "../instruments.ts/instruments";
import { Inventory } from "./inventory";

export type quickAccessItem = {
  id: number;
  isEnabled: boolean;
};

export class QuickAccess {
  public quickAccess: Array<quickAccessItem>;
  protected id = 0;
  public UI: QuickAccessUI;
  constructor(
    private inventory: Inventory,
    protected scene: Scene,
    protected engine: Engine,
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private controls: ControllEvents,
    private instruments: Instruments
  ) {
    this.quickAccess = Array(8).fill(undefined);
    this.quickAccess = this.quickAccess.map((el) => {
      return { id: -1, isEnabled: false };
    });
    this.UI = new QuickAccessUI(
      this.quickAccess,
      this.advancedTexture,
      this.controls,
      this.scene,
      this.instruments
    );
  }

  //функция удаления предмета из инвентаря
  public deleteFromQuickAccessAndFromHand(id: number) {
    const instrument = this.instruments.getByID(id);
    const index = this.quickAccess.findIndex((item) => item.id === id);
    if (index != -1) {
      instrument.mesh.setEnabled(true);
      instrument.isActive = false;
      this.quickAccess[index].id = -1;
      this.quickAccess[index].isEnabled = false;
      this.deleteCell(index, this.UI.quickAccessCells);
      this.UI.correctStorage(this.quickAccess);
    } else return;
  }

  //функция добавления предмета в руку и в инвентарь
  public addInInventoryAndInHand(id: number) {
    const instrument = this.instruments.getByID(id);
    instrument.isActive = true;
    const enableItem = this.quickAccess.find((item) => item.isEnabled);
    if (enableItem) {
      enableItem.isEnabled = false;
      const instrument = this.instruments.getByID(enableItem.id);
      instrument.mesh.setEnabled(false);
      instrument.isActive = false;
    }
    this.calcQuickAccess(id, instrument);
  }

  private calcQuickAccess(id: number, instrument: any) {
    this.calcArray(id);
    this.UI.correctStorage(this.quickAccess);
    this.UI.calcQuickAccessGrid(instrument);
  }

  //функция удаления ячейки инвентаря
  protected deleteCell(index: number, array: Array<GUI.Button>) {
    array[index].textBlock.text = "";
    array[index].image.source = "";
  }

  //функция расчет массива инвентаря
  private calcArray(id: number) {
    const index = this.quickAccess.findIndex((item) => item.id === -1);
    if (index === -1) {
      this.inventory.addInInventory(id);
    } else {
      this.quickAccess[index] = { id: id, isEnabled: true };
    }
  }

  public correctCurrentItem(): instrument {
    const enabledItem = this.quickAccess.find((e) => e.isEnabled);
    return this.instruments.getByID(enabledItem?.id);
  }
}
