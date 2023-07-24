import {
  AbstractMesh,
  BallAndSocketConstraint,
  Mesh,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShape,
  PhysicsShapeCapsule,
  PhysicsShapeCylinder,
  PhysicsShapeMesh,
  PhysicsShapeSphere,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";

import { BigInstruments, bigInstruments } from "./bigInstruments";

export default class Wires {
  public wires: bigInstruments[];
  public redWire: bigInstruments;
  public blueWire: bigInstruments;
  public greywWire: bigInstruments;

  constructor(private scene: Scene) {
    this.wires = [];
    this.redWire = {
      id: 70,
      name: "Красный шланг",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "wire_red",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.wires.push(this.redWire);
    this.blueWire = {
      id: 71,
      name: "Синий шланг",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "wire_blue",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.wires.push(this.blueWire);

    this.greywWire = {
      id: 72,
      name: "Серый шланг",
      imageSrc: "",
      description: "",
      picableMeshes: null,
      meshes: null,
      isActive: false,
      filename: "wire_grey",
      position: Vector3.Zero(),
      rotation: Vector3.Zero(),
    };
    this.wires.push(this.greywWire);
    this.createWiresMeshes();
  }

  private async createWiresMeshes() {
    this.wires.forEach(async (wire) => {
      const meshes = await SceneLoader.ImportMeshAsync(
        "",
        "../assets/models/workshop/",
        wire.filename + ".glb"
      );

      const mesh = meshes.meshes[1];
      const root = mesh.parent;
      meshes.meshes.map((mesh) => {
        mesh.setParent(null);
      });
      root.dispose();

      meshes.meshes.shift();
      meshes.meshes.unshift(meshes.meshes.splice(12, 1)[0]);

      meshes.meshes[0].metadata = {
        isBigItem: true,
        isConditioner: false,
        id: wire.id,
        pikcableMeshIndex: 0,
      };
      wire.picableMeshes = [];
      wire.picableMeshes.push(meshes.meshes[0]);
      const otherMesh = meshes.meshes.at(-1);
      otherMesh.metadata = {
        isBigItem: true,
        isConditioner: false,
        id: wire.id,
        pikcableMeshIndex: 1,
      };
      wire.picableMeshes.push(otherMesh);
      wire.meshes = meshes.meshes;
      this.makePhysics(wire);
    });
  }

  private makePhysics(wire: bigInstruments) {
    wire.meshes.forEach((mesh: Mesh, index) => {
      let mass = index == 0 || index == 1 ? 0.02 : 0.01;
      let body = new PhysicsBody(
        mesh,
        PhysicsMotionType.DYNAMIC,
        true,
        this.scene
      );
      body.setMassProperties({ mass: mass });
      body.setAngularDamping(10);
      body.setLinearDamping(1);
      body.shape = new PhysicsShapeSphere(
        Vector3.Zero(),
        mesh.getBoundingInfo().boundingSphere.radius,
        this.scene
      );
      body.shape.filterMembershipMask = 1; // so they dont collide with each other
      body.shape.filterCollideMask = 2;
    });
    wire.meshes[0].physicsBody.disablePreStep = false;
    wire.meshes.at(-1).physicsBody.disablePreStep = false;
    wire.meshes.forEach((mesh: Mesh, index, wire) => {
      const radius = mesh.getBoundingInfo().boundingSphere.radius;
      let jointYA = -radius;
      let jointYB = radius;
      let joint = new BallAndSocketConstraint(
        new Vector3(0, 0, jointYA),
        new Vector3(0, 0, jointYB),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        this.scene
      );
      if (index + 1 != wire.length) {
        wire[index].physicsBody.addConstraint(
          wire[index + 1].physicsBody,
          joint
        );
      }
    });
  }
}
