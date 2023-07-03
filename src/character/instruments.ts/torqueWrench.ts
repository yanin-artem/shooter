import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class TorqueWrench {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createTorqueWrenchMesh();
    this.name = "Ключ ручка";
    this.imageSrc = "";
    this.description = "";
  }
  private createTorqueWrenchMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_torque_wrench.001.glb"
    ).then((meshes) => {
      const torqueWrench = meshes.meshes[1];

      // torqueWrench.position.set(0, 0, 0);
      const root = torqueWrench.parent;
      torqueWrench.setParent(null);
      root.dispose();
      // torqueWrench.position.set(-6, 5, -5);
      torqueWrench.name = "torqueWrench";
      const torqueWrenchHitbox = torqueWrench.clone(
        "torqueWrenchHitbox",
        torqueWrench
      );
      torqueWrenchHitbox.position = Vector3.Zero();
      torqueWrenchHitbox.scaling.scaleInPlace(2);
      torqueWrenchHitbox.isVisible = false;

      torqueWrench.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      torqueWrench.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = torqueWrench;
    });
  }
}
