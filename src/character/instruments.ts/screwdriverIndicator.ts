import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class ScrewdriverIndicator {
  public id: 0;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createSrewdriverIndicatorMesh();
    this.name = "Отвертка индикаторная";
    this.imageSrc = "../assets/images/screwdriver.jpg";
    this.description =
      "Полезна для откручивания саморезов, болтов и прочего ковыряния";
  }
  private createSrewdriverIndicatorMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_turn_screw_indicator.glb"
    ).then((meshes) => {
      const screwdriverIndicator = meshes.meshes[1];

      // screwdriver.position.set(0, 0, 0);
      const root = screwdriverIndicator.parent;
      screwdriverIndicator.setParent(null);
      root.dispose();
      // screwdriver.position.set(-5, 5, -6);
      screwdriverIndicator.name = "screwdriverIndicator";
      const screwdriverIndicatorHitbox = screwdriverIndicator.clone(
        "screwdriverIndicatorHitbox",
        screwdriverIndicator
      );
      screwdriverIndicatorHitbox.position = Vector3.Zero();
      screwdriverIndicatorHitbox.scaling.scaleInPlace(2);
      screwdriverIndicatorHitbox.isVisible = false;

      // screwdriver.physicsImpostor = new PhysicsImpostor(
      //   screwdriver,
      //   PhysicsImpostor.MeshImpostor,
      //   { mass: 0.01 }
      // );

      screwdriverIndicator.metadata = {
        isItem: true,
        isConditioner: false,
        // id: this.id,
      };
      screwdriverIndicator.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = screwdriverIndicator;
    });
  }
}
