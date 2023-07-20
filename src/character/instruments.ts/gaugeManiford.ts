import { SceneLoader, Vector3 } from "@babylonjs/core";
import { bigInstruments } from "./bigInstruments";

export default class GaugeManiford {
  public gaugeManiford: bigInstruments;
  constructor() {
    this.gaugeManiford = {
      id: 74,
      name: "Измерительный коллектор",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "Tool_Gauge",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.createGaugeManiford();
  }

  private async createGaugeManiford() {
    const meshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      this.gaugeManiford.filename + ".glb"
    );
    const mesh = meshes.meshes[1];
    const root = mesh.parent;
    meshes.meshes.shift();
    meshes.meshes.map((mesh, index) => {
      if (index === 0) mesh.setParent(null);
      else mesh.setParent(meshes.meshes[0]);
    });
    root.dispose();

    mesh.name = this.gaugeManiford.filename;

    mesh.metadata = {
      isBigItem: true,
      isConditioner: false,
      id: this.gaugeManiford.id,
    };

    meshes.meshes[1].metadata = {
      rotationPart: true,
    };

    meshes.meshes[2].metadata = {
      rotationPart: true,
    };

    this.gaugeManiford.picableMeshes = [];
    this.gaugeManiford.picableMeshes.push(mesh);
  }
}
