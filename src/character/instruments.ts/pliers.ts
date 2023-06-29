import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class Pliers {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createPliersMesh();
    this.name = "Пласкогубцы";
    this.imageSrc = "../assets/images/pliers.jpg";
    this.description = "Две красные ручки и железные щипцы";
  }
  private createPliersMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/",
      "instrument_01.glb"
    ).then((meshes) => {
      const pliers = meshes.meshes[1];

      pliers.position.set(0, 0, 0);
      const root = pliers.parent;
      pliers.setParent(null);
      root.dispose();
      pliers.position.set(-6, 5, -5);
      pliers.name = "pliers";
      const pliersHitbox = pliers.clone("pliersHitbox", pliers);
      pliersHitbox.position = Vector3.Zero();
      pliersHitbox.scaling.scaleInPlace(2);
      pliersHitbox.isVisible = false;

      pliers.physicsImpostor = new PhysicsImpostor(
        pliers,
        PhysicsImpostor.MeshImpostor,
        { mass: 0.01 }
      );

      pliers.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      pliers.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = pliers;
    });
  }
}
