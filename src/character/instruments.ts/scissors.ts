import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class Scissors {
  public id: 2;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createScissorsMesh();
    this.name = "Ножницы";
    this.imageSrc = "../assets/images/scissors.jpg";
    this.description = "Просто режет";
  }
  private createScissorsMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_scissors.glb"
    ).then((meshes) => {
      const scissors = meshes.meshes[1];

      // scissors.position.set(0, 0, 0);
      const root = scissors.parent;
      scissors.setParent(null);
      root.dispose();
      // scissors.position.set(-6, 5, -6);
      scissors.name = "scissors";
      const scissorsHitbox = scissors.clone("scissorsHitbox", scissors);
      scissorsHitbox.position = Vector3.Zero();
      scissorsHitbox.scaling.scaleInPlace(2);
      scissorsHitbox.isVisible = false;

      // scissors.physicsImpostor = new PhysicsImpostor(
      //   scissors,
      //   PhysicsImpostor.MeshImpostor,
      //   { mass: 0.01 }
      // );

      scissors.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      scissors.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = scissors;
    });
  }
}
