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
} from "@babylonjs/core";

import { jump } from "./animations/animations";

export default class playerController {
  private walkSpeed: number;
  private sprintSpeed: number;
  private pickedMesh: AbstractMesh;
  private isRunning = false;
  private movingForward = false;
  private movingBack = false;
  private movingLeft = false;
  private movingRight = false;
  private isMoving = false;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private body: AbstractMesh,
    private scene: Scene
  ) {
    this.walkSpeed = 5;
    this.sprintSpeed = 15;
  }
  setController(): void {
    this.handleMovement();

    const observer = this.scene.onKeyboardObservable.add((event) => {
      this.drop(this.hand, event);
      this.setPick(this.camera, this.scene, this.hand, event);
    });
  }

  private handleMovement(): void {
    this.setMovement();

    const observer = this.scene.onKeyboardObservable.add((event) => {
      if (event.event.code === "KeyW" && event.type === 1) {
        this.isMoving = true;
        this.movingForward = true;
      } else if (event.type === 2) {
        this.isMoving = false;
        this.movingForward = false;
      }
      if (event.event.code === "KeyS" && event.type === 1) {
        this.isMoving = true;
        this.movingBack = true;
      } else if (event.type === 2) {
        this.isMoving = false;
        this.movingBack = false;
      }
      if (event.event.code === "KeyD" && event.type === 1) {
        this.isMoving = true;
        this.movingRight = true;
      } else if (event.type === 2) {
        this.isMoving = false;
        this.movingRight = false;
      }
      if (event.event.code === "KeyA" && event.type === 1) {
        this.isMoving = true;
        this.movingLeft = true;
      } else if (event.type === 2) {
        this.isMoving = false;
        this.movingLeft = false;
      }

      if (event.type === 1 && event.event.code === "ShiftLeft") {
        this.isRunning = true;
      } else if (event.type === 2) this.isRunning = false;
    });
  }

  private setMovement(): void {
    this.scene.registerBeforeRender(() => {
      const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

      const currentSpeed = this.isRunning ? this.sprintSpeed : this.walkSpeed;

      if (this.isMoving) {
        this.body.moveWithCollisions(
          this.setMovementDirection().scale(currentSpeed * deltaTime)
        );
      }
    });
  }

  private setMovementDirection(): Vector3 {
    const vector = Vector3.Zero();
    if (this.movingForward && this.movingLeft) {
      vector.set(-1, 0, 1);
    } else if (this.movingForward && this.movingRight) {
      vector.set(1, 0, 1);
    } else if (this.movingBack && this.movingLeft) {
      vector.set(-1, 0, -1);
    } else if (this.movingBack && this.movingRight) {
      vector.set(1, 0, -1);
    } else if (this.movingForward) {
      vector.set(0, 0, 1);
    } else if (this.movingBack) {
      vector.set(0, 0, -1);
    } else if (this.movingLeft) {
      vector.set(-1, 0, 0);
    } else if (this.movingRight) {
      vector.set(1, 0, 0);
    }

    const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
    Vector3.TransformCoordinatesToRef(vector, m, vector);
    return vector;
  }

  private drop(hand: TransformNode, event: KeyboardInfo): void {
    if (event.type === 2 && event.event.code === "KeyE" && this.pickedMesh) {
      hand.getChildMeshes()[0].removeChild(this.pickedMesh);
      this.pickedMesh = null;
    } else return;
  }

  private setPick(
    camera: UniversalCamera,
    scene: Scene,
    hand: TransformNode,
    event: KeyboardInfo
  ): void {
    function setPick() {
      function vecToLocal(vector: Vector3, mesh: UniversalCamera): Vector3 {
        const m = mesh.getWorldMatrix();
        const v = Vector3.TransformCoordinates(vector, m);
        return v;
      }

      // function predicate(mesh: Mesh): boolean {
      //   //??
      //   //разбить проверки
      //   //свойство metadata. ... добавить свойство
      //   // return etadata.
      //   if (
      //     mesh.name == "box" ||
      //     mesh.name == "ground" ||
      //     mesh.isPickable === false
      //   ) {
      //     return false;
      //   }
      //   return true;
      // }

      const origin = camera.position;

      let forward = new Vector3(0, 0, 1);
      forward = vecToLocal(forward, camera);

      let direction = forward.subtract(origin);
      direction = Vector3.Normalize(direction);

      const length = 4;

      const ray = new Ray(origin, direction, length);

      const hit = scene.pickWithRay(ray);

      if (hit.pickedMesh) {
        this.pickedMesh = hit.pickedMesh;
        hand.getChildMeshes()[0].addChild(hit.pickedMesh);
        hit.pickedMesh.position.x = hand.position.x - 50;
        hit.pickedMesh.position.y = hand.position.y + 40;
        hit.pickedMesh.position.z = hand.position.z - 30;
        hit.pickedMesh.rotation = new Vector3(0, 1.7, 1);
      }
    }

    if (event.type === 2 && event.event.code === "KeyE" && !this.pickedMesh) {
      setPick.call(this);
    }
  }
}
