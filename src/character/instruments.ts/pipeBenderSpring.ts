import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class PipeBenderSpring extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
    this.id = 9;
    this.createPipeBenderSpringMesh();
    this.name = "Трубогиб пружинный";
    this.imageSrc = "";
    this.description = "";
  }
  private createPipeBenderSpringMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_Pipe_bender_spring_1.2.glb"
    ).then((meshes) => {
      const pipeBenderSpring = meshes.meshes[1];

      // pipeBenderSpring.position.set(0, 0, 0);
      const root = pipeBenderSpring.parent;
      pipeBenderSpring.setParent(null);
      root.dispose();
      // pipeBenderSpring.position.set(-6, 5, -5);
      pipeBenderSpring.name = "pipeBenderSpring";
      const pipeBenderSpringHitbox = pipeBenderSpring.clone(
        "pipeBenderSpringHitbox",
        pipeBenderSpring
      );
      pipeBenderSpringHitbox.position = Vector3.Zero();
      pipeBenderSpringHitbox.scaling.scaleInPlace(2);
      pipeBenderSpringHitbox.isVisible = false;

      pipeBenderSpring.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      pipeBenderSpring.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pipeBenderSpring;
    });
  }
}
