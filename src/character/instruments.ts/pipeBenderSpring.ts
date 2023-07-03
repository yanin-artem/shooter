import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class PipeBenderSpring {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
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
        // id: this.id,
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
