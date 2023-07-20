import {
  AbstractMesh,
  AnimationGroup,
  Bone,
  Engine,
  Mesh,
  PhysicsAggregate,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeMesh,
  PhysicsShapeType,
  Quaternion,
  Ray,
  Scene,
  SceneLoader,
  Skeleton,
  Space,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { Instruments, instrument } from "./instruments.ts/instruments";
import { bigInstruments } from "./instruments.ts/bigInstruments";

export default class Hands {
  public hand: any;
  public mesh: AbstractMesh;
  public rootNode: TransformNode;
  public skeletons: Skeleton;
  private attachedMeshes: AbstractMesh[];
  private hold: AnimationGroup;
  private open: AnimationGroup;
  private detailScaleK = 3;

  constructor(private parentNode: AbstractMesh, private scene: Scene) {
    this.attachedMeshes = [];
    this.createHand();
    this.changeOnEventHands();
  }
  private async createHand() {
    const loadObject = await SceneLoader.ImportMeshAsync(
      "",
      "../assets/models/character/",
      "normal_hands_anim.glb"
    );

    this.open = loadObject.animationGroups[1];
    this.hold = loadObject.animationGroups[0];
    this.open.start(true, 1, this.open.from, this.open.to, false);
    this.mesh = loadObject.meshes[1];
    this.skeletons = this.mesh.skeleton;
    this.hand = loadObject.meshes[0];
    this.mesh.metadata = { isItem: false, isConditionder: false };
    this.hand.metadata = { isItem: false, isConditionder: false };
    this.rootNode = loadObject.transformNodes[108];
    this.hand.parent = this.parentNode;
    this.hand.position.y = -1.6;
  }
  public closeHand() {
    this.open.stop();
    this.hold.start(true, 1, this.hold.from, this.hold.to, false);
  }

  public openHand() {
    this.hold.stop();
    this.open.start(true, 1, this.open.from, this.open.to, false);
  }

  private changeOnEventHands() {
    document.addEventListener("dropInQuickAccess", () => {
      this.closeHand();
    });
    document.addEventListener("dropInInventory", () => {
      this.openHand();
    });
  }

  public attachToHand(item: instrument) {
    this.attachedMeshes.push(item.mesh);
    this.positionPickedItem(
      this.skeletons.bones[11],
      this.mesh.parent as TransformNode,
      item
    );
  }

  public attachBigItemToHand(item: bigInstruments) {
    this.attachedMeshes.push(item.picableMeshes[0]);
    this.positionBigItem(
      this.skeletons.bones[11],
      this.mesh.parent as TransformNode,
      item
    );
  }

  public dettachFromHand(item: AbstractMesh) {
    item.detachFromBone();
    const index = this.attachedMeshes.findIndex(
      (mesh) => mesh.metadata.id === item.metadata.id
    );
    this.attachedMeshes.splice(index, 1);
  }

  public drop(item: AbstractMesh) {
    const position = item.absolutePosition;
    this.dettachFromHand(item);
    this.openHand();
    item.position = position;
    const shape = new PhysicsShapeMesh(item as Mesh, this.scene);
    const body = new PhysicsBody(
      item,
      PhysicsMotionType.DYNAMIC,
      true,
      this.scene
    );
    shape.material = { friction: 0.8 };
    body.shape = shape;
    body.setMassProperties({ mass: 0.1 });
  }

  public pick(item: instrument) {
    this.attachToHand(item);
    this.closeHand();
  }

  public pickBigMesh(item: bigInstruments) {
    this.attachBigItemToHand(item);
    this.closeHand();
  }

  public positionPickedDetail(
    pickedMesh: AbstractMesh,
    pickedDetail: AbstractMesh,
    pickedItem: AbstractMesh
  ) {
    pickedDetail = pickedMesh;
    if (pickedItem?.isEnabled()) {
      pickedItem.isVisible = false;
    }
    this.mesh.addChild(pickedDetail);
    pickedDetail.position.set(-0.11, 0.073, 0.028);
    pickedDetail.scaling.scaleInPlace(1 / this.detailScaleK);
    pickedDetail?.physicsBody.dispose();
  }

  //функция позиционирования инструмента в руке
  private positionPickedItem(
    bone: Bone,
    node: TransformNode,
    item: instrument
  ) {
    item.mesh.physicsBody?.dispose();
    item.mesh.attachToBone(bone, node);
    item.mesh.position = item.position;
    item.mesh.rotationQuaternion = null;
    item.mesh.rotation.x = item.rotation.x;
    item.mesh.rotation.y = item.rotation.y;
    item.mesh.rotation.z = item.rotation.z;
  }

  private positionBigItem(
    bone: Bone,
    node: TransformNode,
    item: bigInstruments
  ) {
    item.picableMeshes[0].attachToBone(bone, node);
    item.picableMeshes[0].position = item.position;
    item.picableMeshes[0].rotationQuaternion = null;
    item.picableMeshes[0].rotation.x = item.rotation.x;
    item.picableMeshes[0].rotation.y = item.rotation.y;
    item.picableMeshes[0].rotation.z = item.rotation.z;
  }
}
