import {
  AbstractMesh,
  Axis,
  PhysicsImpostor,
  SceneLoader,
  Space,
} from "@babylonjs/core";

export default class Conditioner {
  public conditioner: AbstractMesh[];
  constructor() {}
  public async createConditioner(): Promise<void> {
    const conditionerMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/house/",
      "konder.glb"
    );

    const conditioner = conditionerMeshes.meshes;

    conditioner[0].position.set(-2.9, 4.3, -6);
    conditioner[0].rotate(Axis.Y, Math.PI / 2, Space.WORLD);

    conditioner.forEach((mesh) => {
      mesh.checkCollisions = true;
    });

    this.conditioner = conditioner;
  }
}
