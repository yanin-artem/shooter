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
import Hands from "../hands";
import { BigInstruments } from "../instruments.ts/bigInstruments";

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
    private instruments: Instruments,
    private dropCallBack,
    private openHandCallBack,
    private closeHandCallBack,
    private bigInstruments: BigInstruments
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
      this.instruments,
      this.dropCallBack,
      this.openHandCallBack,
      this.closeHandCallBack
    );
  }

  //функция удаления предмета из инвентаря
  public deleteFromQuickAccessAndFromHand(id: number) {
    const instrument = this.instruments.getByID(id);
    const index = this.quickAccess.findIndex((item) => item.id === id);
    if (index != -1 && instrument) {
      instrument.mesh.setEnabled(true);
      instrument.isActive = false;
    } else if (index != -1) {
      const bigInstrument = this.bigInstruments.getByID(id);
      bigInstrument.meshes.forEach((mesh) => {
        mesh.setEnabled(true);
      });
      bigInstrument.isActive = false;
    } else {
      return;
    }
    this.quickAccess[index].id = -1;
    this.quickAccess[index].isEnabled = false;
    this.deleteCell(index, this.UI.quickAccessCells);
    this.UI.correctStorage(this.quickAccess);
  }

  //функция добавления предмета в руку и в инвентарь
  public addInInventoryAndInHand(id: number) {
    const instrument = this.instruments.getByID(id);
    if (instrument) {
      instrument.isActive = true;
      const enableItem = this.quickAccess.find((item) => item.isEnabled);
      if (enableItem) {
        enableItem.isEnabled = false;
        const instrument = this.instruments.getByID(enableItem.id);
        if (instrument) {
          instrument.mesh.setEnabled(false);
          instrument.isActive = false;
        } else {
          const instrument = this.bigInstruments.getByID(enableItem.id);
          instrument.meshes.forEach((mesh) => {
            mesh.setEnabled(false);
          });
          instrument.isActive = false;
        }
      }
      this.calcQuickAccess(id, instrument);
    } else {
      const bigInstrument = this.bigInstruments.getByID(id);
      bigInstrument.isActive = true;
      const enableItem = this.quickAccess.find((item) => item.isEnabled);
      if (enableItem) {
        enableItem.isEnabled = false;
        const bigInstrument = this.bigInstruments.getByID(enableItem.id);
        if (bigInstrument) {
          bigInstrument.meshes.forEach((mesh) => {
            mesh.setEnabled(false);
          });
          bigInstrument.isActive = false;
        } else {
          const bigInstrument = this.instruments.getByID(enableItem.id);
          bigInstrument.mesh.setEnabled(false);
          bigInstrument.isActive = false;
        }
      }
      this.calcQuickAccess(id, bigInstrument);
    }
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
      this.openHandCallBack();
    } else {
      this.quickAccess[index] = { id: id, isEnabled: true };
    }
  }

  public correctCurrentItem(): instrument {
    const enabledItem = this.quickAccess.find((e) => e.isEnabled);
    return this.instruments.getByID(enabledItem?.id);
  }

  public changeItemInHand(
    hands: Hands,
    pickedItem: AbstractMesh
  ): AbstractMesh {
    if (this.controls.number) {
      const index = this.controls.number - 1;
      this.UI.toggleQuickAccessVisibility();

      const enabledElem = this.quickAccess.find((item) => item.isEnabled);
      if (enabledElem) {
        enabledElem.isEnabled = false;
        const instrument = this.instruments.getByID(enabledElem.id);
        if (instrument) {
          instrument.isActive = false;
          const enabledMesh = instrument.mesh;
          enabledMesh.setEnabled(false);
        } else {
          const bigInstrument = this.bigInstruments.getByID(enabledElem.id);
          bigInstrument.isActive = false;
          const enabledMeshes = bigInstrument.meshes;
          enabledMeshes.forEach((mesh) => {
            mesh.setEnabled(false);
          });
        }
      }
      hands.openHand();

      if (this.quickAccess[index].id != -1) {
        this.quickAccess[index].isEnabled = true;
        const instrument = this.instruments.getByID(this.quickAccess[index].id);
        if (instrument) {
          pickedItem = instrument.mesh;
          instrument.isActive = true;
          pickedItem.setEnabled(true);
        } else {
          const bigInstrument = this.bigInstruments.getByID(
            this.quickAccess[index].id
          );
          pickedItem = bigInstrument.picableMeshes[0];
          bigInstrument.isActive = true;
          bigInstrument.meshes.forEach((mesh) => {
            mesh.setEnabled(true);
          });
        }
        hands.closeHand();
        return pickedItem;
      }
    }

    return pickedItem;
  }

  public isInQuickAccess(id: number) {
    return this.quickAccess.find((item) => item.id === id);
  }
}
