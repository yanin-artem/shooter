import {
  AbstractMesh,
  AnimationGroup,
  Bone,
  Engine,
  Mesh,
  PhysicsImpostor,
  Ray,
  Scene,
  SceneLoader,
  Skeleton,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import ControllEvents from "./characterControls";
import { Instruments, instrument } from "./instruments.ts/instruments";
import GeneralInvenory from "./inventory/generalInvenoty";
import { quickAccessItem } from "./inventory/quickAccess";

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
    document.addEventListener("dropFromInventory", (event: CustomEvent) => {
      const item = event.detail.item;
      this.dettachFromHand(item.mesh);
      item.mesh.setEnabled(true);
      const position = item.mesh.absolutePosition;
      item.mesh.detachFromBone();
      item.mesh.position = position;
      item.mesh.physicsImpostor = new PhysicsImpostor(
        item.mesh,
        PhysicsImpostor.MeshImpostor,
        { mass: 0.1 }
      );
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

  public dettachFromHand(item: AbstractMesh) {
    const index = this.attachedMeshes.findIndex(
      (mesh) => mesh.metadata.id === item.metadata.id
    );
    this.attachedMeshes.splice(index, 1);
  }

  createPickEvents(): void {
    this.scene.onKeyboardObservable.add((event) => {});
  }

  //

  // функция смены моделей рук (сжатая или свободная)

  //функция рэйкастинга в направлении просмотра

  //функция позиционирования детали в руке
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
    pickedDetail?.physicsImpostor.dispose();
  }

  //функция позиционирования инструмента в руке
  private positionPickedItem(
    bone: Bone,
    node: TransformNode,
    item: instrument
  ) {
    item.mesh.physicsImpostor?.dispose();
    item.mesh.attachToBone(bone, node);
    item.mesh.position = item.position;
    item.mesh.rotationQuaternion = null;
    item.mesh.rotation.x = item.rotation.x;
    item.mesh.rotation.y = item.rotation.y;
    item.mesh.rotation.z = item.rotation.z;
  }
}
