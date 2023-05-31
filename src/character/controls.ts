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
  private movingForward = false;
  private movingBack = false;
  private movingLeft = false;
  private movingRight = false;

  private hSpeedVector: Vector3;
  private vSpeedVector = 0;
  private speedVector: Vector3;

  private boostPerTime: number;
  private currentBoost = 0;
  private maxBoost: number;

  private isJump = false;
  private currentJumpBoost: number;

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
        this.movingForward = true;
      } else if (event.type === 2 && event.event.code === "KeyW") {
        this.movingForward = false;
      }
      if (event.event.code === "KeyS" && event.type === 1) {
        this.movingBack = true;
      } else if (event.type === 2 && event.event.code === "KeyS") {
        this.movingBack = false;
      }
      if (event.event.code === "KeyD" && event.type === 1) {
        this.movingRight = true;
      } else if (event.type === 2 && event.event.code === "KeyD") {
        this.movingRight = false;
      }
      if (event.event.code === "KeyA" && event.type === 1) {
        this.movingLeft = true;
      } else if (event.type === 2 && event.event.code === "KeyA") {
        this.movingLeft = false;
      }

      if (event.type === 1 && event.event.code === "ShiftLeft") {
        this.isRunning = true;
      } else if (event.type === 2 && event.event.code === "ShiftLeft")
        this.isRunning = false;

      if (event.type === 1 && event.event.code === "Space" && this.isGround()) {
        this.currentJumpBoost = this.jumpBoost;
        this.isJump = true;
      }
    });
  }

  moveForvard(): void {
    if (!this.movingForward) return;
    if (!this.movingLeft && !this.movingRight) this.hSpeedVector.x = 0;
    if (this.currentBoost < this.maxBoost)
      this.currentBoost += this.boostPerTime;
    this.hSpeedVector.z = 1;
  }

  moveBack(): void {
    if (!this.movingBack) return;
    if (!this.movingLeft && !this.movingRight) this.hSpeedVector.x = 0;
    if (this.currentBoost < this.maxBoost)
      this.currentBoost += this.boostPerTime;
    this.hSpeedVector.z = -1;
  }

  moveLeft(): void {
    if (!this.movingLeft) return;
    if (!this.movingForward && !this.movingBack) this.hSpeedVector.z = 0;
    if (this.currentBoost < this.maxBoost)
      this.currentBoost += this.boostPerTime;
    this.hSpeedVector.x = -1;
  }

  moveRight(): void {
    if (!this.movingRight) return;
    if (!this.movingForward && !this.movingBack) this.hSpeedVector.z = 0;
    if (this.currentBoost < this.maxBoost)
      this.currentBoost += this.boostPerTime;
    this.hSpeedVector.x = 1;
  }

  private setMovement(): void {
    this.hSpeedVector = Vector3.Zero();
    this.speedVector = Vector3.Zero();

    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

      this.boostPerTime = this.isRunning ? this.runBoost : this.walkBoost;
      this.maxBoost = this.boostPerTime * this.maxBoostK;

      if (this.currentBoost > 0) {
        this.currentBoost -= this.currentBoost * this.friсtionK;

        if (this.currentBoost <= 0) {
          this.hSpeedVector = Vector3.Zero();
        }
      }

      this.moveForvard();
      this.moveBack();
      this.moveLeft();
      this.moveRight();
      this.moveVertical();

      this.speedVector = this.hSpeedVector.scale(
        this.deltaTime * this.currentBoost
      );

      this.speedVector.y = this.vSpeedVector;

      const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
      Vector3.TransformCoordinatesToRef(this.speedVector, m, this.speedVector);

      this.body.moveWithCollisions(this.speedVector);
    });
  }

  moveVertical(): void {
    if (!this.isGround() && !this.isJump) {
      this.vSpeedVector = -this.g * this.deltaTime;
    } else if (this.isJump) {
      this.jump();
    } else {
      this.vSpeedVector = 0;
    }
  }

  private jump(): void {
    if (this.currentJumpBoost < 0) {
      this.isJump = false;
    } else {
      this.currentJumpBoost -= this.airResistance * this.deltaTime;
      this.vSpeedVector = this.currentJumpBoost * this.deltaTime;
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
