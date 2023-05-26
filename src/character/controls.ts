import {
  Vector3,
  UniversalCamera,
  Scene,
  Ray,
  TransformNode,
  KeyboardInfo,
  Mesh,
  AbstractMesh,
} from "@babylonjs/core";

import { jump } from "./animations/animations";

export default class Controls {
  private walkSpeed: number;
  private sprintSpeed: number;
  private pickedMesh: AbstractMesh;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private scene: Scene
  ) {
    this.walkSpeed = 1;
    this.sprintSpeed = 2.5;
  }
  //player controller
  setControls(): void {
    const observer = this.scene.onKeyboardObservable.add((event) => {
      this.setMovement(event, this.camera, this.scene);
      this.drop(this.hand, event);
      this.setPick(this.camera, this.scene, this.hand, event);
    });
  }

  private setMovement(
    event: KeyboardInfo,
    camera: UniversalCamera,
    scene: Scene
  ): void {
    //walk
    camera.keysUp.push(87);
    camera.keysLeft.push(65);
    camera.keysDown.push(83);
    camera.keysRight.push(68);

    //jump
    const animationFrames = jump(camera);

    if (event.type === 2 && event.event.code === "Space") {
      scene.beginAnimation(
        camera,
        animationFrames.fstFrame,
        animationFrames.finFrame,
        false
      );
    }

    //sprint
    if (event.type === 1 && event.event.code === "ShiftLeft") {
      camera.speed = this.sprintSpeed;
    } else if (event.type === 2) camera.speed = this.walkSpeed;

    // if (evt.event.code === "KeyW") body.position.z += 0.1 * this.speed;
    // if (evt.event.code === "KeyS") body.position.z -= 0.1 * this.speed;
    // if (evt.event.code === "KeyA") body.position.x -= 0.1 * this.speed;
    // if (evt.event.code === "KeyD") body.position.x += 0.1 * this.speed;
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

      const length = 3;

      const ray = new Ray(origin, direction, length);

      const hit = scene.pickWithRay(ray);

      //const hl = new HighlightLayer("hl1", scene);

      //ПЕРЕДЕЛАТЬ ПО КНОПКЕ
      //сделать переменную для меша

      if (hit.pickedMesh) {
        // hl.addMesh(
        //   //??
        //   hit.pickedMesh,
        //   Color3.Green()
        // );
        // this. = hit.pickedMesh;
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
