import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class PipeBenderCrossbow {
  public id = 7;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createPipeCrossbowMesh();
    this.name = "Трубогиб арбалетного типа";
    this.imageSrc = "";
    this.description = "";
  }
  private createPipeCrossbowMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_pipe_bender_crossbow.glb"
    ).then((meshes) => {
      const pipeBenderCrossbow = meshes.meshes[1];

      // pipeBenderCrossbow.position.set(0, 0, 0);
      const root = pipeBenderCrossbow.parent;
      pipeBenderCrossbow.setParent(null);
      root.dispose();
      // pipeBenderCrossbow.position.set(-6, 5, -5);
      pipeBenderCrossbow.name = "pipeBenderCrossbow";
      const pipeBenderCrossbowHitbox = pipeBenderCrossbow.clone(
        "pipeCrossbowHitbox",
        pipeBenderCrossbow
      );
      pipeBenderCrossbowHitbox.position = Vector3.Zero();
      pipeBenderCrossbowHitbox.scaling.scaleInPlace(2);
      pipeBenderCrossbowHitbox.isVisible = false;

      pipeBenderCrossbow.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      pipeBenderCrossbow.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeBenderCrossbow;
    });
  }
}
