import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class PipeCutterSmall {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createPipeCutterSmallMesh();
    this.name = "Труборез малый";
    this.imageSrc = "";
    this.description = "";
  }
  private createPipeCutterSmallMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_Pipe_cutter_small.glb"
    ).then((meshes) => {
      const pipeCutterSmall = meshes.meshes[1];

      // pipeCutterSmall.position.set(0, 0, 0);
      const root = pipeCutterSmall.parent;
      pipeCutterSmall.setParent(null);
      root.dispose();
      // pipeCutterSmall.position.set(-6, 5, -5);
      pipeCutterSmall.name = "pipeCutterSmall";
      const pipeCutterSmallHitbox = pipeCutterSmall.clone(
        "pipeCutterSmallHitbox",
        pipeCutterSmall
      );
      pipeCutterSmallHitbox.position = Vector3.Zero();
      pipeCutterSmallHitbox.scaling.scaleInPlace(2);
      pipeCutterSmallHitbox.isVisible = false;

      pipeCutterSmall.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      pipeCutterSmall.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeCutterSmall;
    });
  }
}
