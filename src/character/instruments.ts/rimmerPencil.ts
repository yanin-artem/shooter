import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class RimmerPencil extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
    this.id = 13;
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
