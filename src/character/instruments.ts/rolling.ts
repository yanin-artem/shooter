import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class Rolling {
  public id = 14;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createRollingMesh();
    this.name = "Вальцовка";
    this.imageSrc = "";
    this.description = "";
  }
  private createRollingMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_rolling.glb"
    ).then((meshes) => {
      const rolling = meshes.meshes[1];

      // rolling.position.set(0, 0, 0);
      const root = rolling.parent;
      rolling.setParent(null);
      root.dispose();
      // rolling.position.set(-6, 5, -5);
      rolling.name = "rolling";
      const rollingHitbox = rolling.clone("rollingHitbox", rolling);
      rollingHitbox.position = Vector3.Zero();
      rollingHitbox.scaling.scaleInPlace(2);
      rollingHitbox.isVisible = false;

      rolling.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      rolling.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = rolling;
    });
  }
}
