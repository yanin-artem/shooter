import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class LeverPipeExpander extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
    this.id = 6;
    this.createLeverPipeExpanderMesh();
    this.name = "Труборасширитель рычажный";
    this.imageSrc = "../assets/images/leverPipeExpander.jpg";
    this.description = "";
  }
  private createLeverPipeExpanderMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_lever_pipe_expander.glb"
    ).then((meshes) => {
      const leverPipeExpander = meshes.meshes[1];

      // leverPipeExpander.position.set(0, 0, 0);
      const root = leverPipeExpander.parent;
      leverPipeExpander.setParent(null);
      root.dispose();
      // leverPipeExpander.position.set(-6, 5, -5);
      leverPipeExpander.name = "leverPipeExpander";
      const leverPipeExpanderHitbox = leverPipeExpander.clone(
        "leverPipeExpanderHitbox",
        leverPipeExpander
      );
      leverPipeExpanderHitbox.position = Vector3.Zero();
      leverPipeExpanderHitbox.scaling.scaleInPlace(2);
      leverPipeExpanderHitbox.isVisible = false;

      leverPipeExpander.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      leverPipeExpander.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = leverPipeExpander;
    });
  }
}
