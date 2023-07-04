import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class TorqueWrenchNozzle extends Instrument {
  constructor() {
    super();
    this.id = 16;
    this.createTorqueWrenchNozzleMesh();
    this.name = "Насадка на ключ ручку";
    this.imageSrc = "";
    this.description = "";
  }
  private createTorqueWrenchNozzleMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_torque_wrench_nozzle_01.glb"
    ).then((meshes) => {
      const torqueWrenchNozzle = meshes.meshes[1];

      // torqueWrench.position.set(0, 0, 0);
      const root = torqueWrenchNozzle.parent;
      torqueWrenchNozzle.setParent(null);
      root.dispose();
      // torqueWrench.position.set(-6, 5, -5);
      torqueWrenchNozzle.name = "torqueWrenchNozzle";
      const torqueWrenchHitboxNozzle = torqueWrenchNozzle.clone(
        "torqueWrenchHitboxNozzle",
        torqueWrenchNozzle
      );
      torqueWrenchHitboxNozzle.position = Vector3.Zero();
      torqueWrenchHitboxNozzle.scaling.scaleInPlace(2);
      torqueWrenchHitboxNozzle.isVisible = false;

      torqueWrenchNozzle.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      torqueWrenchNozzle.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = torqueWrenchNozzle;
    });
  }
}
