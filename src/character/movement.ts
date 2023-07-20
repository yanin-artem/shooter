import {
  Vector3,
  Scene,
  Ray,
  Mesh,
  AbstractMesh,
  Axis,
  Matrix,
  Engine,
} from "@babylonjs/core";

import ControllEvents from "./characterControls";
import characterStatus from "./characterStatus";

export default class Movement extends characterStatus {
  private isRunning = false;

  private mouseMaxY = 1.08;
  private mouseMinY = -1.25;

  private mouseX = 0;
  private mouseY = 0;
  private mouseSensitivity = 400;
  private mouseYCheck = 0;

  private canSit = true;

  private speedVector: Vector3;
  //координата высоты на которую должен запрыгнуть персонаж
  private jumpDestination: number;
  //если игрок продолжает двигаться вверх
  private isJumping = false;
  //момент прыжка должен исполняться один раз
  private isStartJump = false;

  private deltaTime: number;
  constructor(
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh,
    private controls: ControllEvents
  ) {
    super();

    this.handleMouse();
  }

  // в зависимости от события выставляет вектор ускорения
  public setMovementEvents(): void {
    this.speedVector = Vector3.Zero();
    let accelerationDir = Vector3.Zero();
    const observer = this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleControlEvents(event);
      accelerationDir = Vector3.Zero();
      if (this.controls.run) {
        this.isRunning = true;
      } else this.isRunning = false;

      if (this.controls.forward) {
        accelerationDir.addInPlace(Vector3.Forward());
      }
      if (this.controls.back) {
        accelerationDir.addInPlace(Vector3.Backward());
      }
      if (this.controls.right) {
        accelerationDir.addInPlace(Vector3.Right());
      }
      if (this.controls.left) {
        accelerationDir.addInPlace(Vector3.Left());
      }

      if (this.controls.jump && this.isGround()) {
        this.isStartJump = true;
      }

      if (this.controls.sit) {
        this.sitDown();
      } else {
        this.standUp();
      }
    });
    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      this.handleMovement(accelerationDir);
    });
  }

  private sitDown() {
    if (this.canSit) {
      this.head.position.y -= 1;
      this.canSit = false;
    }
  }

  private standUp() {
    if (!this.canSit) {
      this.head.position.y += 1;
      this.canSit = true;
    }
  }

  // управление поворотом головы персонажа от движения мыши
  private handleMouse() {
    this.scene.onPointerObservable.add((evt) => {
      if (this.engine.isPointerLock) {
        this.mouseX += evt.event.movementX / this.mouseSensitivity;
        this.mouseYCheck += evt.event.movementY / this.mouseSensitivity;
        if (
          this.mouseYCheck <= this.mouseMaxY &&
          this.mouseYCheck >= this.mouseMinY
        ) {
          this.mouseY = this.mouseYCheck;
        } else this.mouseYCheck = this.mouseY;
        this.head.rotation.set(this.mouseY, this.mouseX, 0);
      }
    });
  }

  // общая функция движения, передает результирующий вектор в метод передвижения
  private handleMovement(accelerationDir: Vector3): void {
    this.handleStartJumping();
    const addingAcceleration = this.calcAddingAcceleration(
      accelerationDir,
      this.getAcceleration()
    );
    const resultVector = this.getResultSpeedVector(addingAcceleration);
    this.body.moveWithCollisions(resultVector);
  }

  //формирует направление и скорость передвижения, исходя из ускорения и направления игрока
  private getResultSpeedVector(addingAcceleration: Vector3): Vector3 {
    const resultVector = Vector3.Zero();
    this.speedVector.addInPlace(addingAcceleration.scale(this.deltaTime));
    this.correctMaxSpeed();
    if (addingAcceleration.equals(Vector3.Zero())) this.doBrake();
    this.speedVector = this.handleJumping(this.speedVector);
    const m = Matrix.RotationAxis(Axis.Y, this.head.rotation.y);
    Vector3.TransformCoordinatesToRef(this.speedVector, m, resultVector);
    return resultVector;
  }

  //возвращает ускорение в зависимости от бега или ходьбы
  private getAcceleration(): number {
    return this.isRunning ? this.runAcceleration : this.walkAcceleration;
  }

  //возвращает максимальное ускорение в зависимости от бега или ходьбы
  private getMaxSpeed(): number {
    return this.isRunning ? this.runMaxSpeed : this.walkMaxSpeed;
  }

  //определяет направление ускорения
  private calcAddingAcceleration(
    accelerationDir: Vector3,
    acceleration: number
  ): Vector3 {
    accelerationDir.scaleInPlace(acceleration);
    accelerationDir.y = this.getYAcceleration();
    return accelerationDir.normalize();
  }

  //ускорение по оси Y
  private getYAcceleration(): number {
    if (!this.isGround()) {
      return -this.gravity * this.deltaTime;
    }
    return 0;
  }
  //управление переменными начала прыжка
  private handleStartJumping() {
    if (!this.isGround()) {
      this.isStartJump = false;
    }
    if (this.isStartJump) {
      this.jumpDestination = this.jumpHeight + this.body.position.y;
      this.isJumping = true;
      this.isStartJump = false;
    }
    if (this.isJumping && this.body.position.y >= this.jumpDestination) {
      this.isJumping = false;
    }
  }

  //управление прыжком до высшей точки персонажа
  private handleJumping(speedVector: Vector3): Vector3 {
    if (this.isJumping) {
      const percentDest =
        1 - (this.jumpDestination - this.body.position.y) / this.jumpHeight;
      let jumpSpeedSlowdown = 0;
      if (percentDest > 0.8) {
        jumpSpeedSlowdown = this.jumpSpeed * 0.8;
      } else if (percentDest > 0.4) {
        jumpSpeedSlowdown = this.jumpSpeed * percentDest;
      }
      speedVector.y = this.jumpSpeed - jumpSpeedSlowdown;
    }
    return speedVector;
  }

  //постепенная остановка прыжка
  private doBrake() {
    if (this.speedVector.lengthSquared() > 0.00001)
      this.speedVector.subtractInPlace(this.speedVector.scale(this.slowdownK));
    else this.speedVector = Vector3.Zero();
  }

  //корректировка максимальной скорости
  private correctMaxSpeed(): void {
    const maxSpeed = this.getMaxSpeed();
    let speedVectorWithoutGravity = new Vector3(
      this.speedVector.x,
      0,
      this.speedVector.z
    );

    if (speedVectorWithoutGravity.lengthSquared() > Math.pow(maxSpeed, 2)) {
      speedVectorWithoutGravity = speedVectorWithoutGravity
        .normalize()
        .scale(maxSpeed);
      this.speedVector = new Vector3(
        speedVectorWithoutGravity.x,
        this.speedVector.y,
        speedVectorWithoutGravity.z
      );
    }
  }

  //проверка на земле ли персонаж
  private isGround(): boolean {
    const ray = new Ray(this.body.position, Vector3.Down(), 0.85 + 0.2);
    return this.scene.pickWithRay(ray).hit;
  }
}
