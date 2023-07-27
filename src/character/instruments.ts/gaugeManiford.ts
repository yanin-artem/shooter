import {
  Axis,
  Mesh,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  PhysicsShapeSphere,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { bigInstruments } from "./bigInstruments";

export default class GaugeManiford {
  public gaugeManiford: bigInstruments;
  constructor(private scene: Scene) {
    this.gaugeManiford = {
      id: 75,
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
      pikcableMeshIndex: 0,
    };

    meshes.meshes[1].metadata = {
      rotationPart: true,
      axis: "x",
    };

    meshes.meshes[2].metadata = {
      rotationPart: true,
      axis: "x",
    };

    const shape = new PhysicsShapeMesh(mesh as Mesh, this.scene);
    const body = new PhysicsBody(
      mesh,
      PhysicsMotionType.DYNAMIC,
      false,
      this.scene
    );
    shape.material = { friction: 0.8 };
    body.shape = shape;
    body.setMassProperties({ mass: 0.1 });
    body.disablePreStep = false;
    this.gaugeManiford.meshes = meshes.meshes;
    this.gaugeManiford.picableMeshes = [];
    this.gaugeManiford.picableMeshes.push(mesh);
  }
}
