import {
  AbstractMesh,
  Vector3,
  PhysicsImpostor,
  Scene,
  Ray,
  TransformNode,
  Skeleton,
  Bone,
} from "@babylonjs/core";
import ControllEvents from "../characterControls";

export default class Instrument {
  public id: number;
  public mesh: AbstractMesh;
  public imageSrc: string;
  public name: string;
  public description: string;
  public isActive = false;
  constructor(
    protected scene: Scene,
    protected head: AbstractMesh,
    protected controls: ControllEvents
  ) {}

  public static isInstrument(mesh: AbstractMesh) {
    return mesh.metadata.isItem && mesh.isEnabled();
  }

  protected setEventListener() {
    this.scene.onKeyboardObservable.add(() => {
      this.doInstrumentAction();
    });
  }

  public positionInHand(bone: Bone, node: TransformNode) {}

  //функция рэйкастинга в направлении просмотра
  protected castRay(predicate) {
    const direction = this.getVisionDirection();
    const length = 3;
    const origin = this.head.getAbsolutePosition();
    const ray = new Ray(origin, direction, length);
    return this.scene.pickWithRay(ray, predicate);
  }

  protected getVisionDirection(): Vector3 {
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

    return direction;
  }

  //функция разбора кондиционера отверткой
  protected doInstrumentAction() {
    if (this.controls.takeApart && this.isActive) {
      function predicate(mesh: AbstractMesh): boolean {
        return mesh.isPickable && mesh.metadata.isConditioner;
      }
      const hit = this.castRay(predicate);
      if (hit.pickedMesh && hit.pickedMesh.metadata?.isDetail) {
        hit.pickedMesh.checkCollisions = false;
        hit.pickedMesh.physicsImpostor = new PhysicsImpostor(
          hit.pickedMesh,
          PhysicsImpostor.BoxImpostor,
          { mass: 0.1 }
        );
        hit.pickedMesh.metadata.isConditioner = false;
      }
    }
  }
}
