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
} from "@babylonjs/core";

import characterStatus from "./characterStatus";

export default class playerController extends characterStatus {
  private pickedMesh: AbstractMesh;
  private isRunning = false;

  private speedVector: Vector3;

  private isJumping = false;
  private currentJumpAcceleration: number;
  private YAcceleration = 0;

  private deltaTime: number;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private body: AbstractMesh,
    private scene: Scene
  ) {
    super();
  }
  setController(): void {
    this.setMovementEvents();
    const observer = this.scene.onKeyboardObservable.add((event) => {
      this.drop(this.hand, event);
      this.setPick(this.camera, this.scene, this.hand, event);
    });
  }
  private setMovementEvents(): void {
    this.speedVector = Vector3.Zero();
    this.currentJumpAcceleration = 0;
    let accelerationDir = Vector3.Zero();
    const observer = this.scene.onKeyboardObservable.add((event) => {
      accelerationDir = Vector3.Zero();
      if (event.event.code === "ShiftLeft") {
        this.isRunning = event.type === 1;
      }
      //  else {
      //   accelerationDir = Vector3.Zero();
      // }

      if (event.event.code === "KeyW" && event.type === 1) {
        accelerationDir = Vector3.Forward();
      }
      if (event.event.code === "KeyS" && event.type === 1) {
        accelerationDir = Vector3.Backward();
      }
      if (event.event.code === "KeyD" && event.type === 1) {
        accelerationDir = Vector3.Right();
      }
      if (event.event.code === "KeyA" && event.type === 1) {
        accelerationDir = Vector3.Left();
      }

      if (event.type === 1 && event.event.code === "Space" && this.isGround()) {
        this.isJumping = true;
        this.YAcceleration = this.jumpAcceleration;
      }
    });
    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      this.handleMovement(accelerationDir);
    });
  }
  //убрать return
  //

  handleMovement(accelerationDir: Vector3): void {
    /**вычисляем добавочный вектор (ускорения которое добавляется каждый кадр). нормализовать вектор и вычтено торможение, если нет ускорения. умножили на ускорение*/
    const addingAcceleration = this.calcAddingAcceleration(
      accelerationDir,
      this.getAcceleration() /**внутри ф-ии выбираем ускорение бега или ходьбы */
    );

    const resultVector = this.getResultSpeedVector(
      addingAcceleration,
      accelerationDir
    );

    this.body.moveWithCollisions(resultVector);
  }
  //переименовать
  private getAcceleration(): number {
    return this.isRunning ? this.runAcceleration : this.walkAcceleration;
  }
  //переписать отдельно для бега и ходьбы
  private getMaxSpeed(): number {
    return this.isRunning ? this.runMaxSpeed : this.walkMaxSpeed;
  }

  private calcAddingAcceleration(
    accelerationDir: Vector3,
    acceleration: number
  ): Vector3 {
    accelerationDir.y = this.getYAcceleration();
    return accelerationDir.normalize().scale(acceleration);
  }

  getYAcceleration(): number {
    if (!this.isGround()) {
      this.isJumping = false;
      return (this.YAcceleration -= this.g * this.deltaTime);
    }
    if (this.isJumping && this.YAcceleration > 0) {
      return (this.YAcceleration -= this.airResistance * this.deltaTime);
    }
    if (this.isGround() && !this.isJumping) {
      return (this.YAcceleration = 0);
    }
  }

  private getResultSpeedVector(
    addingAcceleration: Vector3,
    accelerationDir: Vector3
  ): Vector3 {
    const resultVector = Vector3.Zero();
    this.speedVector.addInPlace(addingAcceleration.scale(this.deltaTime));

    this.checkMaxSpeed();

    if (addingAcceleration.equals(Vector3.Zero())) this.doBrake();

    console.log(this.speedVector);
    //переписать направление камеры от капсуля
    const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
    Vector3.TransformCoordinatesToRef(this.speedVector, m, resultVector);
    return resultVector;
  }

  private doBrake() {
    //использовать квадрат длинны
    if (this.speedVector.length() > 0.001)
      this.speedVector.subtractInPlace(this.speedVector.scale(this.slowdownK));
    else this.speedVector = Vector3.Zero();
  }

  private checkMaxSpeed() {
    const maxSpeed = this.getMaxSpeed();

    if (this.speedVector.lengthSquared() > Math.pow(maxSpeed, 2)) {
      this.speedVector = this.speedVector.normalize().scale(maxSpeed);
    }
  }
  //
  // private setMovement(): void {
  //   this.hSpeedVector = Vector3.Zero();
  //   this.speedVector = Vector3.Zero();

  //   this.scene.registerBeforeRender(() => {
  //     this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

  //     this.maxBoost = this.boostPerTime * this.maxBoostK;

  //     if (this.currentBoost > 0) {
  //       this.currentBoost -= this.currentBoost * this.friсtionK;

  //       if (this.currentBoost <= 0) {
  //         this.hSpeedVector = Vector3.Zero();
  //       }
  //     }

  //     this.moveVertical();
  //     //вектор скорости и вектор ускорения
  //     this.speedVector = this.hSpeedVector.scale(
  //       this.deltaTime * this.currentBoost
  //     );

  //     this.speedVector.y = this.vSpeedVector;

  //     const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
  //     Vector3.TransformCoordinatesToRef(this.speedVector, m, this.speedVector);

  //     this.body.moveWithCollisions(this.speedVector);
  //   });
  // // }

  // moveVertical(): void {
  //   if (!this.isGround() && !this.isJump) {
  //     this.vSpeedVector = -this.g * this.deltaTime;
  //   } else if (this.isJump) {
  //     this.jump();
  //   } else {
  //     this.vSpeedVector = 0;
  //   }
  // }

  // private jump(): void {
  //   if (this.currentJumpBoost < 0) {
  //     this.isJump = false;
  //   } else {
  //     this.currentJumpBoost -= this.airResistance * this.deltaTime;
  //     this.vSpeedVector = this.currentJumpBoost * this.deltaTime;
  //   }
  // }

  isGround(): boolean {
    const ray = new Ray(this.body.position, Vector3.Down(), 0.85 + 0.2);
    return this.scene.pickWithRay(ray).hit;
  }

  private drop(hand: TransformNode, event: KeyboardInfo): void {
    if (event.type === 2 && event.event.code === "KeyE" && this.pickedMesh) {
      hand.getChildMeshes()[0].removeChild(this.pickedMesh);
      this.pickedMesh.physicsImpostor = new PhysicsImpostor(
        this.pickedMesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 1 }
      );
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

      function predicate(mesh: Mesh): boolean {
        return mesh.metadata.isTool && mesh.isPickable;
      }

      const origin = camera.globalPosition;

      let forward = new Vector3(0, 0, 1);
      forward = vecToLocal(forward, camera);

      let direction = forward.subtract(origin);
      direction = Vector3.Normalize(direction);

      const length = 2;

      const ray = new Ray(origin, direction, length);

      const hit = scene.pickWithRay(ray, predicate);

      if (hit.pickedMesh) {
        this.pickedMesh = hit.pickedMesh;
        hit.pickedMesh.physicsImpostor.dispose();
        hand.getChildMeshes()[0].addChild(hit.pickedMesh);
        hit.pickedMesh.position.x = hand.position.x - 30;
        hit.pickedMesh.position.y = hand.position.y + 30;
        hit.pickedMesh.position.z = hand.position.z - 30;
        hit.pickedMesh.rotation = new Vector3(0, 1.7, 0.8);
      }
    }

    if (event.type === 2 && event.event.code === "KeyE" && !this.pickedMesh) {
      setPick.call(this);
    }
  }
}
