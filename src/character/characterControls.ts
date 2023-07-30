import { KeyboardInfo, PointerInfo } from "@babylonjs/core";
import Root from "../scene/root";

export default class ControllEvents {
  public forward = false;
  public right = false;
  public back = false;
  public left = false;
  public run = false;
  public jump = false;
  public pickInHand = false;
  public pickInInventar = false;
  public drop = false;
  public useItem = false;
  public showInventar = false;
  public showQuickAccess = false;
  public number: number;
  public manyPick = false;
  public sit = false;
  public deltaScroll = 0;
  public tasks = false;

  public handleControlEvents(event: KeyboardInfo) {
    if (event.event.code === "KeyW") {
      event.event.preventDefault();
      this.forward = event.type === 1;
    }
    if (event.event.code === "KeyS") {
      event.event.preventDefault();
      this.back = event.type === 1;
    }
    if (event.event.code === "KeyD") {
      event.event.preventDefault();
      this.right = event.type === 1;
    }
    if (event.event.code === "KeyA") {
      event.event.preventDefault();
      this.left = event.type === 1;
    }
    if (event.event.code === "ShiftLeft") this.run = event.type === 1;
    if (event.event.code === "Space") this.jump = event.type === 1;
    if (event.event.code === "KeyH") this.pickInHand = event.type === 1;
    if (event.event.code === "KeyG") this.pickInInventar = event.type === 1;
    if (event.event.code === "KeyT") this.drop = event.type === 1;
    if (event.event.code === "KeyF") {
      event.event.preventDefault();
      this.useItem = event.type === 1;
    }
    if (
      event.event.inputIndex >= 49 &&
      event.event.inputIndex <= 56 &&
      event.type === 1
    ) {
      this.number = +event.event.key;
    } else this.number = 0;
    if (event.event.shiftKey && event.event.code === "KeyG")
      this.manyPick = event.type === 1;
    if (event.event.code === "ControlLeft") {
      event.event.preventDefault();
      this.sit = event.type === 1;
    }
  }

  public handleTasksMenuEvents(event: KeyboardInfo) {
    if (event.event.code === "Tab" && event.type === 1) {
      event.event.preventDefault();
      this.tasks = !this.tasks;
    }
  }
  public handleMouseEvents(event: any) {
    event.event.preventDefault();
    this.deltaScroll = event.event.deltaY;
  }
  public handleInventoryEvents(event: KeyboardInfo) {
    if (event.event.code === "KeyI" && event.type === 1)
      this.showInventar = !this.showInventar;
  }
  public handleQuickAccessEvents(event: KeyboardInfo) {
    if (event.event.code === "KeyI" && event.type === 1)
      this.showQuickAccess = !this.showQuickAccess;
  }
}
