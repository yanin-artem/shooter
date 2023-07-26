import {
  Mesh,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import { bigInstruments } from "./bigInstruments";

export default class FreonEvacuator {
  public freonEvacuator: bigInstruments;
  constructor(private scene: Scene) {
    this.freonEvacuator = {
      id: 74,
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
      pikcableMeshIndex: 0,
    };

    meshes.meshes[1].metadata = {
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
    this.freonEvacuator.meshes = meshes.meshes;
    this.freonEvacuator.picableMeshes = [];
    this.freonEvacuator.picableMeshes.push(mesh);
  }
}
