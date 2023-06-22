import { Engine, Scene } from "@babylonjs/core";

export default class Root {
  public static usePointerLock = true;
  public static isMenuScreen = false;

  constructor(private scene: Scene, private engine: Engine) {
    this.setPointerLock();
  }

  private setPointerLock() {
    this.scene.onPointerDown = () => {
      if (!this.engine.isPointerLock && Root.usePointerLock)
        this.engine.enterPointerlock();
    };
  }
}
