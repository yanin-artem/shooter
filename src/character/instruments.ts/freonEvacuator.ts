import { SceneLoader, Vector3 } from "@babylonjs/core";
import { bigInstruments } from "./bigInstruments";

export default class FreonEvacuator {
  public freonEvacuator: bigInstruments;
  constructor() {
    this.freonEvacuator = {
      id: 73,
      name: "Станция эвакуации",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "Tool_Freon",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.createFreonEvacuator();
  }

  private async createFreonEvacuator() {
    const meshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      this.freonEvacuator.filename + ".glb"
    );
    const mesh = meshes.meshes[1];
    const root = mesh.parent;
    meshes.meshes.shift();
    meshes.meshes.map((mesh, index) => {
      if (index === 0) mesh.setParent(null);
      else mesh.setParent(meshes.meshes[0]);
    });
    root.dispose();

    mesh.name = this.freonEvacuator.filename;

    mesh.metadata = {
      isBigItem: true,
      isConditioner: false,
      id: this.freonEvacuator.id,
    };

    meshes.meshes[1].metadata = {
      freonEvacuatorRotation: true,
    };

    this.freonEvacuator.picableMeshes = [];
    this.freonEvacuator.picableMeshes.push(mesh);
  }
}
