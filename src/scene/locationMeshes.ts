import {
  AbstractMesh,
  Mesh,
  MeshBuilder,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsShapeMesh,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import Conditioner from "./conditioner";

export default class LocationMeshes {
  private static instance: LocationMeshes;
  private scene: Scene;
  public houseLocation: {
    home: AbstractMesh;
    plinth: AbstractMesh[];
    instrumentsBox: AbstractMesh[];
    conditioner: AbstractMesh[];
    ground: Mesh;
  };

  public workshopLoation: {
    workshop: AbstractMesh[];
  };

  private constructor() {}

  public async CreateHouseLocation(body: AbstractMesh): Promise<void> {
    body.position.set(0, 15, 0);
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 40, height: 40 },
      this.scene
    );
    ground.position.y = 4.359;

    const shape = new PhysicsShapeMesh(ground, this.scene);
    const groundBody = new PhysicsBody(
      ground,
      PhysicsMotionType.STATIC,
      true,
      this.scene
    );
    shape.material = {};
    groundBody.shape = shape;
    groundBody.setMassProperties({ mass: 0 });

    ground.checkCollisions = true;
    ground.isVisible = false;

    const homeMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/house/",
      "home.glb"
    );
    const home = homeMeshes.meshes[1];
    home.position.y = home.position.y - home.position.y / 2;
    const homeBox = MeshBuilder.CreateBox("homeBox", {
      width: 5,
      height: 5,
      depth: 5,
    });
    homeBox.position.set(-0.001, 6.513, -5.405);
    homeBox.scaling.set(0.838, 0.864, 1.235);
    const shapehomeBox = new PhysicsShapeMesh(ground, this.scene);
    const bodyhomeBox = new PhysicsBody(
      homeBox,
      PhysicsMotionType.STATIC,
      true,
      this.scene
    );
    shapehomeBox.material = {};
    bodyhomeBox.shape = shapehomeBox;
    bodyhomeBox.setMassProperties({ mass: 0 });
    homeBox.checkCollisions = true;
    homeBox.isVisible = false;
    const rightHomeCollumn = MeshBuilder.CreateBox("rightHomeCollumn", {
      width: 0.5,
      height: 5,
      depth: 1,
    });
    rightHomeCollumn.position.set(2.412, 6.837, -3.044);
    rightHomeCollumn.scaling.set(1.201, 0.992, 1.504);
    rightHomeCollumn.isVisible = false;
    rightHomeCollumn.checkCollisions = true;
    const leftHomeCollumn = rightHomeCollumn.clone("leftHomeCollumn");
    const shapeleftHomeCollumn = new PhysicsShapeMesh(ground, this.scene);
    const bodyleftHomeCollumn = new PhysicsBody(
      leftHomeCollumn,
      PhysicsMotionType.STATIC,
      false,
      this.scene
    );
    shapeleftHomeCollumn.material = {};
    bodyleftHomeCollumn.shape = shapeleftHomeCollumn;
    bodyleftHomeCollumn.setMassProperties({ mass: 0 });
    leftHomeCollumn.position.x = -2.413;
    const invisibleBackwardWall = MeshBuilder.CreateBox(
      "invisibleBackwardWall",
      {
        width: 25,
        height: 5,
        depth: 0.5,
      }
    );
    invisibleBackwardWall.position.set(0, 6.701, -8.756);
    invisibleBackwardWall.isVisible = false;
    invisibleBackwardWall.checkCollisions = true;
    const invisibleLeftWall1 = MeshBuilder.CreateBox("invisibleLeftWall1", {
      width: 0.5,
      height: 5,
      depth: 15,
    });
    invisibleLeftWall1.position.set(11.417, 6.701, -1.098);
    invisibleLeftWall1.checkCollisions = true;
    invisibleLeftWall1.isVisible = false;
    const invisibleLeftWall2 = MeshBuilder.CreateBox("invisibleLeftWall2", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall2.position.set(11.03, 6.701, 2.554);
    invisibleLeftWall2.rotation.set(0, -Math.PI / 11.36, 0);
    invisibleLeftWall2.checkCollisions = true;
    invisibleLeftWall2.isVisible = false;
    const invisibleLeftWall3 = MeshBuilder.CreateBox("invisibleLeftWall3", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall3.position.set(9.611, 6.701, 5.068);
    invisibleLeftWall3.rotation.set(0, -Math.PI / 4.376, 0);
    invisibleLeftWall3.checkCollisions = true;
    invisibleLeftWall3.isVisible = false;
    const invisibleLeftWall4 = MeshBuilder.CreateBox("invisibleLeftWall4", {
      width: 0.5,
      height: 5,
      depth: 4,
    });
    invisibleLeftWall4.position.set(6.393, 6.701, 7.465);
    invisibleLeftWall4.rotation.set(0, -Math.PI / 2.7547, 0);
    invisibleLeftWall4.checkCollisions = true;
    invisibleLeftWall4.isVisible = false;
    const invisibleRightWall1 = invisibleLeftWall1.clone("invisibleRightWall1");
    invisibleRightWall1.position.x = -11.425;
    const invisibleRightWall2 = invisibleLeftWall2.clone("invisibleRightWall2");
    invisibleRightWall2.position.set(-10.451, 6.701, 3.778);
    invisibleRightWall2.rotation.set(0, Math.PI / 6.52, 0);
    const invisibleRightWall3 = invisibleLeftWall3.clone("invisibleRightWall3");
    invisibleRightWall3.position.set(-7.828, 6.701, 6.78);
    invisibleRightWall3.rotation.set(0, Math.PI / 3.265, 0);

    const invisibleForwardWall = MeshBuilder.CreateBox("invisibleForwardWall", {
      width: 15,
      height: 5,
      depth: 0.5,
    });

    invisibleForwardWall.position.set(0, 6.701, 8.861);
    invisibleForwardWall.checkCollisions = true;
    invisibleForwardWall.isVisible = false;

    const roofElem1 = MeshBuilder.CreateBox("roofElem1", {
      width: 0.5,
      height: 2,
      depth: 1,
    });
    roofElem1.position.set(-9.98, 5.131, -1.594);
    roofElem1.scaling.set(1.201, 0.992, 1.504);
    roofElem1.isVisible = false;
    roofElem1.checkCollisions = true;

    const roofElem2 = roofElem1.clone("roofElem2");
    roofElem2.position.z = -4.391;
    roofElem2.isVisible = false;
    roofElem2.checkCollisions = true;

    const roofElem3 = roofElem1.clone("roofElem3");
    roofElem3.position.x = 10.013;
    roofElem3.isVisible = false;
    roofElem3.checkCollisions = true;

    const roofElem4 = roofElem3.clone("roofElem4");
    (roofElem4.position.z = -4), 391;
    roofElem4.isVisible = false;
    roofElem4.checkCollisions = true;

    const plinthMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/house/",
      "for_konder.glb"
    );
    const plinth = plinthMeshes.meshes;
    plinth[0].position.set(-2.99, 4.48, -6.745);

    plinth.forEach((mesh) => {
      mesh.checkCollisions = true;
    });

    const instrumentsBoxMeshes = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/house/",
      "box_instrument.glb"
    );

    const instrumentsBox = instrumentsBoxMeshes.meshes;
    instrumentsBox[0].setParent(null);
    instrumentsBox[0].position.set(-5, 4.68, -7);

    const conditioner = new Conditioner();
    await conditioner.createConditioner();

    this.houseLocation = {
      home: home,
      plinth: plinth,
      instrumentsBox: instrumentsBox,
      conditioner: conditioner.conditioner,
      ground: ground,
    };

    for (let key in this.houseLocation) {
      if (Array.isArray(this.houseLocation[key]))
        this.houseLocation[key].forEach((el) => {
          el.metadata = { isItem: false, isConditioner: false };
        });
      else {
        this.houseLocation[key].metadata = {
          isItem: false,
          isConditioner: false,
        };
      }
    }
    this.houseLocation.conditioner.map((mesh, index) => {
      mesh.metadata.isConditioner = true;
      mesh.metadata["id"] = index;
      mesh.name === "Корпус"
        ? (mesh.metadata.isDetail = false)
        : (mesh.metadata.isDetail = true);
    });

    const door = MeshBuilder.CreateBox("doorToWorkshop", {
      height: 2,
      depth: 0.5,
      width: 1,
    });

    door.position.set(-1.103, 5.383, -2.501);

    door.metadata = {
      isItem: false,
      isConditioner: false,
      isDoorToWorkshop: true,
    };

    door.isVisible = false;
  }

  public async createWorkshopLocation(): Promise<void> {
    const door = MeshBuilder.CreateBox("doorToHouse", {
      height: 2,
      depth: 1,
      width: 0.5,
    });

    door.isVisible = false;

    door.position.set(12.505, 1.005, -3.788);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 40, height: 40 },
      this.scene
    );

    const shape = new PhysicsShapeMesh(ground, this.scene);
    const body = new PhysicsBody(
      ground,
      PhysicsMotionType.STATIC,
      false,
      this.scene
    );
    shape.material = {};
    body.shape = shape;
    body.setMassProperties({ mass: 0 });

    ground.checkCollisions = true;
    ground.position.y = -0.024;
    ground.isVisible = false;

    const workshop = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/workshop/",
      "workshop.glb"
    );
    workshop.meshes.forEach((mesh) => (mesh.checkCollisions = true));
    this.workshopLoation = { workshop: workshop.meshes };
    this.scene.meshes.map((mesh) => {
      mesh.metadata = { isItem: false, isConditioner: false };
    });

    door.metadata["isDoorToHouse"] = true;
  }

  public disposeHomeLocation() {
    for (let key in this.houseLocation) {
      if (Array.isArray(this.houseLocation[key]))
        this.houseLocation[key].forEach((el) => {
          el.dispose();
        });
      else {
        this.houseLocation[key].dispose();
      }
    }
  }

  public static Instance(scene: Scene) {
    if (this.instance) return this.instance;
    else {
      this.instance = new this();
      this.instance.scene = scene;
      return this.instance;
    }
  }
}
