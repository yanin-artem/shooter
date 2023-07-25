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

export default class Ballon {
  public ballon: bigInstruments;
  constructor(private scene: Scene) {
    this.ballon = {
      id: 75,
      name: "Баллон",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "Tool_Ballon",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.createBallon();
  }

  private async createBallon() {
    const meshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      this.ballon.filename + ".glb"
    );
    const mesh = meshes.meshes[1];
    const root = mesh.parent;
    meshes.meshes.shift();
    meshes.meshes.map((mesh, index) => {
      if (index === 0) mesh.setParent(null);
      else mesh.setParent(meshes.meshes[0]);
    });
    root.dispose();

    mesh.name = this.ballon.filename;

    mesh.metadata = {
      isBigItem: true,
      isConditioner: false,
      id: this.ballon.id,
      pikcableMeshIndex: 0,
    };

    meshes.meshes[1].metadata = {
      rotationPart: true,
    };
    meshes.meshes[2].metadata = {
      rotationPart: true,
    };
    meshes.meshes[3].metadata = {
      rotationPart: true,
    };
    meshes.meshes[4].metadata = {
      rotationPart: true,
    };

    const shape = new PhysicsShapeMesh(mesh as Mesh, this.scene);
    const body = new PhysicsBody(
      mesh,
      PhysicsMotionType.DYNAMIC,
      true,
      this.scene
    );
    shape.material = { friction: 0.8 };
    body.shape = shape;
    body.setMassProperties({ mass: 0.1 });
    body.disablePreStep = false;
    this.ballon.meshes = meshes.meshes;
    this.ballon.picableMeshes = [];
    this.ballon.picableMeshes.push(mesh);
  }
}
