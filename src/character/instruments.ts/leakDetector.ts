import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";

export default class LeakDetecor {
  public id = 5;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  constructor() {
    this.createLeakDetectorMesh();
    this.name = "Детектор утечек";
    this.imageSrc = "../assets/images/leakDetector.jpg";
    this.description = "";
  }
  private createLeakDetectorMesh() {
    SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "tool_leak_detector.glb"
    ).then((meshes) => {
      const leakDetector = meshes.meshes[1];

      // leakDetector.position.set(0, 0, 0);
      const root = leakDetector.parent;
      leakDetector.setParent(null);
      root.dispose();
      // leakDetector.position.set(-6, 5, -5);
      leakDetector.name = "leakDetector";
      const leakDetectorHitbox = leakDetector.clone(
        "leakDetectorHitbox",
        leakDetector
      );
      leakDetectorHitbox.position = Vector3.Zero();
      leakDetectorHitbox.scaling.scaleInPlace(2);
      leakDetectorHitbox.isVisible = false;

      leakDetector.metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      leakDetector.getChildMeshes()[0].metadata = {
        isItem: true,
        isConditioner: false,
        id: this.id,
      };
      this.mesh = leakDetector;
    });
  }
}
