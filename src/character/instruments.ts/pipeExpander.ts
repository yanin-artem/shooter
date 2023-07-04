import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class PipeExpander extends Instrument {
  constructor() {
    super();
    this.id = 4;
    this.createPipeExpanderMesh();
    this.name = "Труборасширитель";
    this.imageSrc = "";
    this.description = "расширитель труб";
  }
  private createPipeExpanderMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_pipe_expander.glb"
    ).then((meshes) => {
      const pipeExpander = meshes.meshes[1];

      // pipeExpander.position.set(0, 0, 0);
      const root = pipeExpander.parent;
      pipeExpander.setParent(null);
      root.dispose();
      // pipeExpander.position.set(-6, 5, -5);
      pipeExpander.name = "pipeExpander";
      const pipeExpanderHitbox = pipeExpander.clone(
        "pipeExpanderHitbox",
        pipeExpander
      );
      pipeExpanderHitbox.position = Vector3.Zero();
      pipeExpanderHitbox.scaling.scaleInPlace(2);
      pipeExpanderHitbox.isVisible = false;

      pipeExpander.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      pipeExpander.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeExpander;
    });
  }
}
