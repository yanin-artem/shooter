import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class RimmerPencil {
  public id = 13;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createRimmerPencilMesh();
    this.name = "Риммер карандаш";
    this.imageSrc = "";
    this.description = "";
  }
  private createRimmerPencilMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_rimmer_pencil.glb"
    ).then((meshes) => {
      const rimmerPencil = meshes.meshes[1];

      // rimmerPencil.position.set(0, 0, 0);
      const root = rimmerPencil.parent;
      rimmerPencil.setParent(null);
      root.dispose();
      // rimmerPencil.position.set(-6, 5, -5);
      rimmerPencil.name = "rimmerPencil";
      const rimmerPencilHitbox = rimmerPencil.clone(
        "rimmerPencilHitbox",
        rimmerPencil
      );
      rimmerPencilHitbox.position = Vector3.Zero();
      rimmerPencilHitbox.scaling.scaleInPlace(2);
      rimmerPencilHitbox.isVisible = false;

      rimmerPencil.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      rimmerPencil.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = rimmerPencil;
    });
  }
}
