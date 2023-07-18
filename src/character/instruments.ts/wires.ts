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

export type wires = {
  id: number;
  name: string;
  imageSrc: string;
  description: string;
  meshes: AbstractMesh[];
  isActive: boolean;
  filename: string;
};

export default class Wires {
  private wires: wires[];
  private redWire: wires;
  private blueWire: wires;
  private yellowWire: wires;

  constructor(private scene: Scene) {
    this.wires = [];
    this.redWire = {
      id: 70,
      name: "Красный шланг",
      imageSrc: "",
      description: "",
      meshes: null,
      isActive: false,
      filename: "wirered",
    };
    this.wires.push(this.redWire);
    this.blueWire = {
      id: 71,
      name: "Синий шланг",
      imageSrc: "",
      description: "",
      meshes: null,
      isActive: false,
      filename: "wireblue",
    };
    this.wires.push(this.blueWire);

    this.yellowWire = {
      id: 72,
      name: "Желтый шланг",
      imageSrc: "",
      description: "",
      meshes: null,
      isActive: false,
      filename: "wireyellow",
    };
    this.wires.push(this.yellowWire);
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
      meshes.meshes.forEach((mesh) => {
        mesh.setParent(null);
      });
      root.dispose();

      mesh.metadata = {
        isItem: true,
        isConditioner: false,
        id: wire.id,
      };
      // mesh.getChildMeshes()[0].metadata = {
      //   isItem: true,
      //   isConditioner: false,
      //   id: wire.id,
      // };
      meshes.meshes.shift();
      wire.meshes = meshes.meshes;
      console.log(wire);
      this.makePhysics(wire);
    });
  }

  private makePhysics(wire: wires) {
    wire.meshes.forEach((mesh: Mesh, index) => {
      let mass = index == 0 || index == 1 ? 0.02 : 0.01;
      let body =
        index === 0 || index === 1
          ? new PhysicsBody(mesh, PhysicsMotionType.STATIC, true, this.scene)
          : new PhysicsBody(mesh, PhysicsMotionType.DYNAMIC, true, this.scene);
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
      console.log(joint);
      if (index + 1 != wire.length) {
        wire[index].physicsBody.addConstraint(
          wire[index + 1].physicsBody,
          joint
        );
      }
    });
  }
}
