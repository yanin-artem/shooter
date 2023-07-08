import {
  AbstractMesh,
  AnimationGroup,
  Scene,
  SceneLoader,
  Skeleton,
  TransformNode,
} from "@babylonjs/core";

export default class Hands {
  public hand: any;
  public mesh: AbstractMesh;
  public rootNode: TransformNode;
  public skeletons: Skeleton;
  private attachedMeshes: AbstractMesh[];
  private hold: AnimationGroup;
  private open: AnimationGroup;
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
    console.log(this.mesh);
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
    this.scene.onKeyboardObservable.add((event) => {
      if (event.type === 2) {
        if (this.attachedMeshes.find((mesh) => mesh.isEnabled()))
          this.closeHand();
        else this.openHand();
      }
    });
    this.scene.onPointerObservable.add((event) => {
      if (event.event.button === 0) {
        if (this.attachedMeshes.find((mesh) => mesh.isEnabled()))
          this.closeHand();
        else this.openHand();
      }
    });
  }

  public attachToHand(item: AbstractMesh) {
    this.attachedMeshes.push(item);
  }

  public dettachFromHand(item: AbstractMesh) {
    const index = this.attachedMeshes.findIndex(
      (mesh) => mesh.metadata.id === item.metadata.id
    );
    this.attachedMeshes.splice(index, 1);
  }
}
