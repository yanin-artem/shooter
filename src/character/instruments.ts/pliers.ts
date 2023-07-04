import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class Pliers extends Instrument {
  constructor() {
    super();
    this.id = 1;
    this.createPliersMesh();
    this.name = "Пласкогубцы";
    this.imageSrc = "../assets/images/pliers.jpg";
    this.description = "Две красные ручки и железные щипцы";
  }
  private createPliersMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_pliers.glb"
    ).then((meshes) => {
      const pliers = meshes.meshes[1];

      // pliers.position.set(0, 0, 0);
      const root = pliers.parent;
      pliers.setParent(null);
      root.dispose();
      // pliers.position.set(-6, 5, -5);
      pliers.name = "pliers";
      const pliersHitbox = pliers.clone("pliersHitbox", pliers);
      pliersHitbox.position = Vector3.Zero();
      pliersHitbox.scaling.scaleInPlace(2);
      pliersHitbox.isVisible = false;

      pliers.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
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
