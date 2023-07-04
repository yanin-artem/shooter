import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class RimmerBarrel extends Instrument {
  constructor() {
    super();
    this.id = 12;
    this.createRimmerBarrelMesh();
    this.name = "Риммер цилиндр";
    this.imageSrc = "";
    this.description = "";
  }
  private createRimmerBarrelMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_rimmer_barrel.glb"
    ).then((meshes) => {
      const rimmerBarrel = meshes.meshes[1];

      // rimmerBarrel.position.set(0, 0, 0);
      const root = rimmerBarrel.parent;
      rimmerBarrel.setParent(null);
      root.dispose();
      // rimmerBarrel.position.set(-6, 5, -5);
      rimmerBarrel.name = "rimmerBarrel";
      const rimmerBarrelHitbox = rimmerBarrel.clone(
        "rimmerBarrelHitbox",
        rimmerBarrel
      );
      rimmerBarrelHitbox.position = Vector3.Zero();
      rimmerBarrelHitbox.scaling.scaleInPlace(2);
      rimmerBarrelHitbox.isVisible = false;

      rimmerBarrel.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      rimmerBarrel.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = rimmerBarrel;
    });
  }
}
