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
  RayHelper,
  PhysicsImpostor,
} from "@babylonjs/core";

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
  private isJump = false;
  private deltaTime: number;
  private deltaJump: number;
  protected vSpeed = 0;
  private moveVector: Vector3;

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
    this.setHorizontalMovement();
    this.setVerticalMovement();
    const observer = this.scene.onKeyboardObservable.add((event) => {
      if (event.event.code === "KeyW" && event.type === 1) {
        this.isMoving = true;
        this.movingForward = true;
      } else if (event.type === 2 && event.event.code === "KeyW") {
        this.isMoving = false;
        this.movingForward = false;
      }
      if (event.event.code === "KeyS" && event.type === 1) {
        this.isMoving = true;
        this.movingBack = true;
      } else if (event.type === 2 && event.event.code === "KeyS") {
        this.isMoving = false;
        this.movingBack = false;
      }
      if (event.event.code === "KeyD" && event.type === 1) {
        this.isMoving = true;
        this.movingRight = true;
      } else if (event.type === 2 && event.event.code === "KeyD") {
        this.isMoving = false;
        this.movingRight = false;
      }
      if (event.event.code === "KeyA" && event.type === 1) {
        this.isMoving = true;
        this.movingLeft = true;
      } else if (event.type === 2 && event.event.code === "KeyA") {
        this.isMoving = false;
        this.movingLeft = false;
      }

      if (event.type === 1 && event.event.code === "ShiftLeft") {
        this.isRunning = true;
      } else if (event.type === 2 && event.event.code === "ShiftLeft")
        this.isRunning = false;

      if (event.type === 1 && event.event.code === "Space" && this.isGround()) {
        this.deltaJump = this.deltaTime * 10;
        this.isJump = true;
      }
    });
  }

  private setHorizontalMovement(): void {
    this.scene.registerBeforeRender(() => {
      this.deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

      const currentSpeed = this.isRunning ? this.sprintSpeed : this.walkSpeed;

      if (this.isMoving || !this.isGround() || this.isJump) {
        this.body.moveWithCollisions(
          this.setMovementDirection().scale(currentSpeed * this.deltaTime)
        );
      }
    });
  }

  private setMovementDirection(): Vector3 {
    this.moveVector = Vector3.Zero();

    if (this.movingForward && this.movingLeft) {
      this.moveVector.set(-1, 0, 1);
    } else if (this.movingForward && this.movingRight) {
      this.moveVector.set(1, 0, 1);
    } else if (this.movingBack && this.movingLeft) {
      this.moveVector.set(-1, 0, -1);
    } else if (this.movingBack && this.movingRight) {
      this.moveVector.set(1, 0, -1);
    } else if (this.movingForward) {
      this.moveVector.set(0, 0, 1);
    } else if (this.movingBack) {
      this.moveVector.set(0, 0, -1);
    } else if (this.movingLeft) {
      this.moveVector.set(-1, 0, 0);
    } else if (this.movingRight) {
      this.moveVector.set(1, 0, 0);
    }
    this.moveVector.y = this.vSpeed;
    const m = Matrix.RotationAxis(Axis.Y, this.camera.rotation.y);
    Vector3.TransformCoordinatesToRef(this.moveVector, m, this.moveVector);
    return this.moveVector;
  }

  setVerticalMovement(): void {
    this.scene.registerBeforeRender(() => {
      if (!this.isGround() && !this.isJump) {
        this.vSpeed = -2;
      } else if (this.isJump) {
        this.jump();
      } else {
        this.vSpeed = 0;
      }
    });
  }

  private jump(): void {
    if (this.deltaJump < 0) {
      this.isJump = false;
    } else {
      this.deltaJump -= this.deltaTime;
      this.vSpeed = 9.81 * this.deltaJump;
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
