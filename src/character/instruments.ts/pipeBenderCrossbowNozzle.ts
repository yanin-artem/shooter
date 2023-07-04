import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class PipeBenderCrossbowNozzle extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
    this.id = 8;
    this.createPipeBenderCrossbowNozzleMesh();
    this.name = "Насадка на трубогиб арбалетного типа";
    this.imageSrc = "";
    this.description = "";
  }
  private createPipeBenderCrossbowNozzleMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_pipe_bender_crossbow_nozzle_01.glb"
    ).then((meshes) => {
      const pipeBenderCrossbowNozzle = meshes.meshes[1];

      // pipeBenderCrossbowNozzle.position.set(0, 0, 0);
      const root = pipeBenderCrossbowNozzle.parent;
      pipeBenderCrossbowNozzle.setParent(null);
      root.dispose();
      // pipeBenderCrossbowNozzle.position.set(-6, 5, -5);
      pipeBenderCrossbowNozzle.name = "pipeBenderCrossbowNozzle";
      const pipeBenderCrossbowNozzleHitbox = pipeBenderCrossbowNozzle.clone(
        "pipeBenderCrossbowNozzleHitbox",
        pipeBenderCrossbowNozzle
      );
      pipeBenderCrossbowNozzleHitbox.position = Vector3.Zero();
      pipeBenderCrossbowNozzleHitbox.scaling.scaleInPlace(2);
      pipeBenderCrossbowNozzleHitbox.isVisible = false;

      pipeBenderCrossbowNozzle.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      pipeBenderCrossbowNozzle.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeBenderCrossbowNozzle;
    });
  }
}
