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
import ControllEvents from "./characterControls";

export default class playerController extends characterStatus {
  private pickedMesh: AbstractMesh;
  private isRunning = false;

  private speedVector: Vector3;
  private controls: ControllEvents;
  //координата высоты на которую должен запрыгнуть персонаж
  private jumpDestination: number;
  //если игрок продолжает двигаться вверх
  private isJumping = false;
  //момент прыжка должен исполняться один раз
  private isStartJump = false;

  private deltaTime: number;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private body: AbstractMesh,
    private scene: Scene
  ) {
    super();
    this.controls = new ControllEvents();
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
    });
    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      this.handleMovement(accelerationDir);
    });
  }

  handleMovement(accelerationDir: Vector3): void {
    this.handleStartJumping();
    const addingAcceleration = this.calcAddingAcceleration(
      accelerationDir,
      this.getAcceleration()
    );

    const resultVector = this.getResultSpeedVector(addingAcceleration);

    this.body.moveWithCollisions(resultVector);
  }

  private getAcceleration(): number {
    return this.isRunning ? this.runAcceleration : this.walkAcceleration;
  }
  private getMaxSpeed(): number {
    return this.isRunning ? this.runMaxSpeed : this.walkMaxSpeed;
  }
  private calcAddingAcceleration(
    accelerationDir: Vector3,
    acceleration: number
  ): Vector3 {
    accelerationDir.scaleInPlace(acceleration);
    accelerationDir.y = this.getYAcceleration();
    return accelerationDir.normalize();
  }

  getYAcceleration(): number {
    if (!this.isGround()) {
      return -this.gravity * this.deltaTime;
    }
    return 0;
  }

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

  private getResultSpeedVector(addingAcceleration: Vector3): Vector3 {
    const resultVector = Vector3.Zero();
    this.speedVector.addInPlace(addingAcceleration.scale(this.deltaTime));

    this.correctMaxSpeed();

    if (addingAcceleration.equals(Vector3.Zero())) this.doBrake();

    this.speedVector = this.handleJumping(this.speedVector);
    console.log(this.speedVector);
    //переписать направление камеры от капсуля
    const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
    Vector3.TransformCoordinatesToRef(this.speedVector, m, resultVector);
    return resultVector;
  }

  private doBrake() {
    if (this.speedVector.lengthSquared() > 0.00001)
      this.speedVector.subtractInPlace(this.speedVector.scale(this.slowdownK));
    else this.speedVector = Vector3.Zero();
  }

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
