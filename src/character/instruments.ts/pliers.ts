import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
  Scene,
  TransformNode,
  Skeleton,
  Bone,
} from "@babylonjs/core";
import Instrument from "./instrument";
import ControllEvents from "../characterControls";

export default class Pliers extends Instrument {
  constructor(scene: Scene, head: AbstractMesh, controls: ControllEvents) {
    super(scene, head, controls);
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

  public override positionInHand(closedHand: Bone) {
    this.mesh.physicsImpostor?.dispose();
    this.mesh.position.set(0.42813, -0.5731, -0.14786);
    this.mesh.rotationQuaternion = null;
    this.mesh.rotation.set(Math.PI / 13, Math.PI / 15, -Math.PI / 2.4);
  }
}
