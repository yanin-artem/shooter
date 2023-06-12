import {
  Vector3,
  UniversalCamera,
  Scene,
  Ray,
  TransformNode,
  KeyboardInfo,
  Mesh,
  AbstractMesh,
  Axis,
  Matrix,
  PhysicsImpostor,
  Engine,
  RayHelper,
  Quaternion,
  Space,
  PointerInfo,
} from "@babylonjs/core";

export default class Pick {
  private pickedMesh: any;
  private pickedDetail: any;
  private detailScaleK = 3;
  constructor(
    private camera: UniversalCamera,
    private hand: AbstractMesh,
    private closedHand: AbstractMesh,
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh
  ) {}

  createPickEvents(): void {
    this.scene.onKeyboardObservable.add((event) => {
      this.drop(this.hand, event);
      this.dropDetail(event);

      this.setPick(event);

      this.toggleHand(event);
    });

    this.scene.onPointerObservable.add((event) => {
      this.doToolAction(event);
    });
  }
  private drop(hand: AbstractMesh, event: KeyboardInfo): void {
    if (
      event.type === 2 &&
      event.event.code === "KeyE" &&
      this.pickedMesh &&
      !this.pickedDetail
    ) {
      this.closedHand.removeChild(this.pickedMesh);
      this.pickedMesh.physicsImpostor = new PhysicsImpostor(
        this.pickedMesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedMesh.checkCollisions = true;
      this.pickedMesh = null;
    } else return;
  }

  private setPick(event: KeyboardInfo): void {
    if (event.type === 2 && event.event.code === "KeyE" && !this.pickedMesh) {
      function predicate(mesh: AbstractMesh): boolean {
        return (
          (mesh.metadata.isDetail &&
            !mesh.metadata.isConditioner &&
            mesh.isPickable) ||
          (mesh.metadata.isTool && mesh.isPickable)
        );
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh) {
        hit.pickedMesh.checkCollisions = false;
        if (hit.pickedMesh.metadata.isTool === true)
          this.positionPickedTool(hit.pickedMesh);
        if (hit.pickedMesh.metadata.isDetail === true)
          this.positionPickedDetail(hit.pickedMesh);
      }
    }
  }

  private doToolAction(event: PointerInfo) {
    if (
      this.pickedMesh?.metadata.toolIndex === 1 &&
      event.type === 2 &&
      event.event.button === 0 &&
      !this.pickedDetail &&
      this.pickedMesh
    ) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.isPickable && mesh.metadata.isConditioner;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh && hit.pickedMesh.metadata.isDetail) {
        hit.pickedMesh.checkCollisions = false;
        this.positionPickedDetail(hit.pickedMesh);
      }
    }
  }

  private dropDetail(event: KeyboardInfo) {
    if (event.type === 2 && event.event.code === "KeyE" && this.pickedDetail) {
      this.closedHand.removeChild(this.pickedDetail);
      this.pickedDetail.physicsImpostor = new PhysicsImpostor(
        this.pickedDetail,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedDetail.metadata.isConditioner = false;
      this.pickedDetail.scaling.scaleInPlace(this.detailScaleK);
      console.log(this.pickedDetail);
      this.pickedDetail.checkCollisions = true;
      this.pickedDetail = null;
      if (this.pickedMesh) this.pickedMesh.getChildMeshes()[0].isVisible = true;
    }
  }

  private toggleHand(event: KeyboardInfo): void {
    if (
      event.type === 2 &&
      event.event.code === "KeyE" &&
      this.closedHand.getChildMeshes()[1] != null
    ) {
      this.hand.getChildMeshes()[0].isVisible = false;
      this.closedHand.getChildMeshes()[0].isVisible = true;
    } else if (this.closedHand.getChildMeshes()[1] == null) {
      this.hand.getChildMeshes()[0].isVisible = true;
      this.closedHand.getChildMeshes()[0].isVisible = false;
    }
  }

  private castRay(predicate) {
    function vecToLocal(vector: Vector3): Vector3 {
      const m = this.head.getWorldMatrix();
      const v = Vector3.TransformCoordinates(vector, m);
      return v;
    }
    const origin = this.head.getAbsolutePosition();
    let forward = new Vector3(0, 0, 1);
    forward = vecToLocal.call(this, forward);
    let direction = forward.subtract(origin);
    direction = Vector3.Normalize(direction);
    const length = 2;
    const ray = new Ray(origin, direction, length);
    return this.scene.pickWithRay(ray, predicate);
  }

  private positionPickedDetail(pickedMesh: AbstractMesh) {
    this.pickedDetail = pickedMesh;
    if (this.pickedMesh) {
      this.pickedMesh.getChildMeshes()[0].isVisible = false;
    }
    this.closedHand.addChild(this.pickedDetail);
    this.pickedDetail.position.set(-0.11, 0.073, 0.028);
    this.pickedDetail.scaling.scaleInPlace(1 / this.detailScaleK);
    this.pickedDetail?.physicsImpostor.dispose();
  }

  private positionPickedTool(pickedMesh: AbstractMesh) {
    this.pickedMesh = pickedMesh.parent || pickedMesh;
    this.pickedMesh.physicsImpostor.dispose();
    this.closedHand.addChild(this.pickedMesh);
    this.pickedMesh.position.set(-0.11, 0.073, 0.028);
    this.pickedMesh.rotationQuaternion = null;
    this.pickedMesh.rotation.set(0, 0, 0);
  }
}
