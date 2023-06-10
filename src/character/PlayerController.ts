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
} from "@babylonjs/core";

import characterStatus from "./characterStatus";
import ControllEvents from "./characterControls";

export default class playerController extends characterStatus {
  private pickedMesh: any;
  private pickedDetail: any;
  private rayToDetail: any;

  private isRunning = false;

  private mouseX = 0;
  private mouseY = 0;
  private mouseSensitivity = 200;

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
    private hand: AbstractMesh,
    private closedHand: AbstractMesh,
    private body: AbstractMesh,
    private scene: Scene,
    private engine: Engine,
    private head: Mesh
  ) {
    super();
    this.controls = new ControllEvents();
  }
  setController(): void {
    this.setMovementEvents();

    const observer = this.scene.onKeyboardObservable.add((event) => {
      if (event.type === 2) {
        console.log(this.rayToDetail);
        this.dropDetail(event);
        this.doToolAction(event);
        this.drop(this.hand, event);

        this.setPick(
          this.camera,
          this.head,
          this.scene,
          this.hand,
          this.closedHand,
          this.pickedMesh,
          event,
          this.rayToDetail
        );
      }
      this.toggleHand(event);
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
    this.handleMouse();
  }
  //вращение тела от движения мыши
  //TODO:константы вместо чисел
  private handleMouse() {
    // this.body.billboardMode = 2;
    this.scene.onPointerObservable.add((evt) => {
      if (this.engine.isPointerLock) {
        const mouseYCheck =
          this.mouseY + evt.event.movementX / this.mouseSensitivity;
        if (mouseYCheck >= 1.25) {
          this.mouseY = 1.25;
        } else if (mouseYCheck <= -1.25) {
          this.mouseY = -1.25;
        } else this.mouseY += evt.event.movementY / this.mouseSensitivity;
        this.mouseX += evt.event.movementX / this.mouseSensitivity;
        this.head.rotation.set(this.mouseY, this.mouseX, 0);
        // console.log(this.body.rotation);
      }
    });
  }

  private handleMovement(accelerationDir: Vector3): void {
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
    const m = Matrix.RotationAxis(Axis.Y, this.head.rotation.y);
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

  private drop(hand: AbstractMesh, event: KeyboardInfo): void {
    if (
      event.type === 2 &&
      event.event.code === "KeyE" &&
      this.pickedMesh &&
      !this.pickedDetail &&
      !this.rayToDetail
    ) {
      this.closedHand.removeChild(this.pickedMesh);
      this.pickedMesh.physicsImpostor = new PhysicsImpostor(
        this.pickedMesh,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );

      this.pickedMesh = null;
    } else return;
  }

  private setPick(
    camera: UniversalCamera,
    head: Mesh,
    scene: Scene,
    hand: AbstractMesh,
    closedHand: AbstractMesh,
    pickedMesh: any,
    event: KeyboardInfo,
    rayToDetail: boolean
  ): void {
    function setPick() {
      // rayToDetail = false;
      function vecToLocal(vector: Vector3): Vector3 {
        const m = head.getWorldMatrix();
        const v = Vector3.TransformCoordinates(vector, m);
        return v;
      }

      function predicate(mesh: AbstractMesh): boolean {
        return mesh.metadata.isTool && mesh.isPickable;
      }
      const origin = head.getAbsolutePosition();
      let forward = new Vector3(0, 0, 1);
      forward = vecToLocal(forward);
      let direction = forward.subtract(origin);
      direction = Vector3.Normalize(direction);

      const length = 2;

      const ray = new Ray(origin, direction, length);

      const hit = scene.pickWithRay(ray, predicate);

      if (hit.pickedMesh) {
        pickedMesh = hit.pickedMesh.parent || hit.pickedMesh;
        // pickedMesh.rotation.set(0, 0, 0);
        pickedMesh.physicsImpostor.dispose();

        closedHand.addChild(pickedMesh);
        // pickedMesh.rotate(Axis.Y, Math.PI, Space.LOCAL);

        // pickedMesh.rotationQuaternion = Quaternion.FromEulerAngles(
        //   0.0006097567345314843,
        //   0.00035494871206856324,
        //   -0.00039326042950118054
        // );
        // console.log(pickedMesh.rotationQuaternion.toEulerAngles());
        pickedMesh.position.set(-0.11, 0.073, 0.028);
        pickedMesh.rotationQuaternion = null;
        pickedMesh.rotation.set(0, 0, 0);
        return pickedMesh;
      }
    }
    if (event.type === 2 && event.event.code === "KeyE" && !this.pickedMesh) {
      this.pickedMesh = setPick();
    }
  }
  private doToolAction(event: KeyboardInfo) {
    if (
      this.pickedMesh?.metadata.toolIndex === 1 &&
      event.type === 2 &&
      event.event.code === "KeyE" &&
      !this.pickedDetail
    ) {
      function vecToLocal(vector: Vector3, mesh: Mesh): Vector3 {
        const m = mesh.getWorldMatrix();
        const v = Vector3.TransformCoordinates(vector, m);
        return v;
      }
      function predicate(mesh: AbstractMesh): boolean {
        console.log(mesh.name);
        return mesh.isPickable && mesh.metadata.isConditioner;
      }
      const origin = this.head.getAbsolutePosition();
      let forward = new Vector3(0, 0, 1);
      forward = vecToLocal(forward, this.head);

      let direction = forward.subtract(origin);
      direction = Vector3.Normalize(direction);

      const length = 2;

      const ray = new Ray(origin, direction, length);
      // this.rayToDetail = true;
      const hit = this.scene.pickWithRay(ray, predicate);
      if (hit.pickedMesh) {
        this.pickedDetail = hit.pickedMesh;
        this.pickedMesh.getChildMeshes()[0].isVisible = false;
        this.closedHand.addChild(this.pickedDetail);
        this.pickedDetail.position = Vector3.Forward();
        this.pickedDetail?.physicsImpostor.dispose();
      }
    }
  }
  private dropDetail(event: KeyboardInfo) {
    if (
      event.type === 2 &&
      event.event.code === "KeyE" &&
      this.pickedMesh &&
      this.pickedDetail
    ) {
      this.closedHand.removeChild(this.pickedDetail);
      this.pickedDetail.physicsImpostor = new PhysicsImpostor(
        this.pickedDetail,
        PhysicsImpostor.BoxImpostor,
        { mass: 0.1 }
      );
      this.pickedDetail.metadata.isTool = true;
      this.pickedDetail.metadata.isDetail = false;

      this.pickedDetail = null;
      this.pickedMesh.getChildMeshes()[0].isVisible = true;
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
}
