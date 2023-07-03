import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class Wrench {
  public id: 1;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createWrenchMesh();
    this.name = "Гаечный ключ";
    this.imageSrc = "";
    this.description = "гаечный ключ";
  }
  private createWrenchMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_wrench_6mm.glb"
    ).then((meshes) => {
      const wrench = meshes.meshes[1];

      // wrench.position.set(0, 0, 0);
      const root = wrench.parent;
      wrench.setParent(null);
      root.dispose();
      // wrench.position.set(-6, 5, -5);
      wrench.name = "wrench";
      const wrenchHitbox = wrench.clone("wrenchHitbox", wrench);
      wrenchHitbox.position = Vector3.Zero();
      wrenchHitbox.scaling.scaleInPlace(2);
      wrenchHitbox.isVisible = false;

      wrench.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      wrench.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = wrench;
    });
  }
}
