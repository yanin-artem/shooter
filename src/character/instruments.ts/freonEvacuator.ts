import {
  Axis,
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
      min: 3.2,
      max: -3.2,
    };
    //power
    meshes.meshes[2].metadata = {
      button: true,
      axis: "x",
      angle: Math.PI * 2,
      isActive: false,
    };
    meshes.meshes[2].rotation =
      meshes.meshes[2].rotationQuaternion.toEulerAngles();
    meshes.meshes[2].rotationQuaternion = null;
    //auto
    meshes.meshes[3].metadata = {
      button: true,
      axis: "z",
      angle: Math.PI / 5.8,
      isActive: false,
    };

    console.log(meshes);
    meshes.meshes[3].rotation =
      meshes.meshes[3].rotationQuaternion.toEulerAngles();
    meshes.meshes[3].rotationQuaternion = null;

    //start
    meshes.meshes[4].metadata = {
      button: true,
      isActive: false,
      startButton: true,
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
