import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class Rolling extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
    this.id = 14;
    this.createRollingMesh();
    this.name = "Вальцовка";
    this.imageSrc = "";
    this.description = "";
  }
  private createRollingMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_rolling.glb"
    ).then((meshes) => {
      const rolling = meshes.meshes[1];

      // rolling.position.set(0, 0, 0);
      const root = rolling.parent;
      rolling.setParent(null);
      root.dispose();
      // rolling.position.set(-6, 5, -5);
      rolling.name = "rolling";
      const rollingHitbox = rolling.clone("rollingHitbox", rolling);
      rollingHitbox.position = Vector3.Zero();
      rollingHitbox.scaling.scaleInPlace(2);
      rollingHitbox.isVisible = false;

      rolling.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      rolling.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = rolling;
    });
  }
}
