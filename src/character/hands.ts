import {
  AbstractMesh,
  AnimationGroup,
  Scene,
  SceneLoader,
  TransformNode,
} from "@babylonjs/core";

export default class Hands {
  public hand: any;
  public mesh: AbstractMesh;
  public rootNode: TransformNode;
  private hold: AnimationGroup;
  private open: AnimationGroup;
  constructor(private parentNode: AbstractMesh, private scene: Scene) {
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
        if (this.rootNode.getChildMeshes().find((mesh) => mesh.isEnabled()))
          this.closeHand();
        else this.openHand();
      }
    });
    this.scene.onPointerObservable.add((event) => {
      if (event.event.button === 0) {
        if (this.rootNode.getChildMeshes().find((mesh) => mesh.isEnabled()))
          this.closeHand();
        else this.openHand();
      }
    });
  }
}
