import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class PipeCutterBig extends Instrument {
  constructor() {
    super();
    this.id = 10;
    this.createPipeCutterBigMesh();
    this.name = "Труборез большой";
    this.imageSrc = "";
    this.description = "";
  }
  private createPipeCutterBigMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_Pipe_cutter_big.glb"
    ).then((meshes) => {
      const pipeCutterBig = meshes.meshes[1];

      // pipeCutterBig.position.set(0, 0, 0);
      const root = pipeCutterBig.parent;
      pipeCutterBig.setParent(null);
      root.dispose();
      // pipeCutterBig.position.set(-6, 5, -5);
      pipeCutterBig.name = "pipeCutterBig";
      const pipeCutterBigHitbox = pipeCutterBig.clone(
        "pipeCutterBigHitbox",
        pipeCutterBig
      );
      pipeCutterBigHitbox.position = Vector3.Zero();
      pipeCutterBigHitbox.scaling.scaleInPlace(2);
      pipeCutterBigHitbox.isVisible = false;

      pipeCutterBig.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      pipeCutterBig.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeCutterBig;
    });
  }
}
