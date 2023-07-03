import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class PipeExpander {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
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
        // id: this.id,
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
