import {
  AbstractMesh,
  SceneLoader,
  Vector3,
  PhysicsImpostor,
} from "@babylonjs/core";
import Instrument from "./instrument";

export default class LeakDetecor extends Instrument {
  constructor() {
    super();
    this.createLeakDetectorMesh();
    this.id = 5;
    this.name = "Детектор утечек";
    this.imageSrc = "";
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
