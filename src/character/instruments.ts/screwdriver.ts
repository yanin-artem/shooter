import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class Screwdriver {
  public id: 0;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createSrewdriverMesh();
    this.name = "Отвертка";
    this.imageSrc = "../assets/images/screwdriver.jpg";
    this.description =
      "Полезна для откручивания саморезов, болтов и прочего ковыряния";
  }
  private createSrewdriverMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_turn_screw_04.glb"
    ).then((meshes) => {
      const screwdriver = meshes.meshes[1];

      // screwdriver.position.set(0, 0, 0);
      const root = screwdriver.parent;
      screwdriver.setParent(null);
      root.dispose();
      // screwdriver.position.set(-5, 5, -6);
      screwdriver.name = "screwdriver";
      const screwdriverHitbox = screwdriver.clone(
        "screwdriverHitbox",
        screwdriver
      );
      screwdriverHitbox.position = Vector3.Zero();
      screwdriverHitbox.scaling.scaleInPlace(2);
      screwdriverHitbox.isVisible = false;

      // screwdriver.physicsImpostor = new PhysicsImpostor(
      //   screwdriver,
      //   PhysicsImpostor.MeshImpostor,
      //   { mass: 0.01 }
      // );

      screwdriver.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      screwdriver.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = screwdriver;
    });
  }
}
