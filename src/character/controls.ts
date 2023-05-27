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
} from "@babylonjs/core";

import { jump } from "./animations/animations";

export default class Controls extends AbstractMesh {
  private walkSpeed: number;
  private sprintSpeed: number;
  private pickedMesh: AbstractMesh;
  private isRunning = false;
  private movingForward = false;
  private movingBack = false;
  private movingLeft = false;
  private movingRight = false;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private body: Mesh,
    private scene: Scene
  ) {
    super("Player");

    this.walkSpeed = 1;
    this.sprintSpeed = 2.5;
  }
  //player controller
  setControls(): void {
    this.setMovement(this.camera, this.scene);

    const observer = this.scene.onKeyboardObservable.add((event) => {
      this.drop(this.hand, event);
      this.setPick(this.camera, this.scene, this.hand, event);
    });
  }

  private setMovement(camera: UniversalCamera, scene: Scene): void {
    //walk
    // camera.keysUp.push(87);
    // camera.keysLeft.push(65);
    // camera.keysDown.push(83);
    // camera.keysRight.push(68);

    //jump
    // this.playerWrapper = this;
    // this.body.setParent(this.playerWrapper);
    const playerWrapper = new AbstractMesh("playerWrapper");
    playerWrapper.scaling = new Vector3(0.4, 1.7, 0.4);
    this.body.parent = playerWrapper;
    playerWrapper.scaling = this.body.scaling;
    // console.log(this.body.parent);
    camera.parent = playerWrapper;
    camera.position.y = 2;
    this.body.position.y = 1.3;

    scene.registerBeforeRender(() => {
      const deltaTime = scene.getEngine().getDeltaTime() / 1000;

      const cameraDirection = camera
        .getDirection(Vector3.Forward())
        .normalizeToNew();

      const currentSpeed = this.isRunning ? this.sprintSpeed : this.walkSpeed;
      if (this.movingForward) {
        playerWrapper.moveWithCollisions(
          cameraDirection.scale(currentSpeed * deltaTime)
        );
      }

      if (this.movingBack) {
        playerWrapper.moveWithCollisions(
          cameraDirection.scale(-currentSpeed * 0.6 * deltaTime)
        );
      }

      if (this.movingLeft) {
        playerWrapper.moveWithCollisions(
          cameraDirection.cross(Axis.Y).scale(currentSpeed * deltaTime)
        );
      }

      if (this.movingRight) {
        playerWrapper.moveWithCollisions(
          cameraDirection.cross(Axis.Y).scale(-currentSpeed * deltaTime)
        );
      }
      playerWrapper.position.y = 0;
    });
    // const animationFrames = jump(camera);

    // if (event.type === 2 && event.event.code === "Space") {
    //   scene.beginAnimation(
    //     camera,
    //     animationFrames.fstFrame,
    //     animationFrames.finFrame,
    //     false
    //   );
    // }

    // //sprint
    // if (event.type === 1 && event.event.code === "ShiftLeft") {
    //   camera.speed = this.sprintSpeed;
    // } else if (event.type === 2) camera.speed = this.walkSpeed;
    const observer = scene.onKeyboardObservable.add((event) => {
      if (event.event.code === "KeyW" && event.type === 1) {
        this.movingForward = true;
      } else if (event.type === 2) {
        this.movingForward = false;
      }
      if (event.event.code === "KeyS" && event.type === 1)
        this.movingBack = true;
      else if (event.type === 2) this.movingBack = false;
      if (event.event.code === "KeyD" && event.type === 1)
        this.movingRight = true;
      else if (event.type === 2) this.movingRight = false;
      if (event.event.code === "KeyA" && event.type === 1)
        this.movingLeft = true;
      else if (event.type === 2) this.movingLeft = false;
    });
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

      //const hl = new HighlightLayer("hl1", scene);

      //ПЕРЕДЕЛАТЬ ПО КНОПКЕ
      //сделать переменную для меша
      console.log("function");

      if (hit.pickedMesh) {
        // hl.addMesh(
        //   //??
        //   hit.pickedMesh,
        //   Color3.Green()
        // );
        // this. = hit.pickedMesh;
        console.log(hit);
        this.pickedMesh = hit.pickedMesh;
        hand.getChildMeshes()[0].addChild(hit.pickedMesh);
        hit.pickedMesh.position.x = hand.position.x - 50;
        hit.pickedMesh.position.y = hand.position.y + 40;
        hit.pickedMesh.position.z = hand.position.z - 30;
        hit.pickedMesh.rotation = new Vector3(0, 1.7, 1);
      }
    }

    if (event.type === 2 && event.event.code === "KeyE" && !this.pickedMesh) {
      console.log("pick");
      setPick.call(this);
    }
  }
}
