import {
  Vector3,
  UniversalCamera,
  Scene,
  Ray,
  TransformNode,
  KeyboardInfo,
  Mesh,
} from "@babylonjs/core";

import { jump } from "./animations/animations";

export default class Controls {
  private _walkSpeed: number;
  private _sprintSpeed: number;

  constructor(
    private camera: UniversalCamera,
    private hand: TransformNode,
    private scene: Scene
  ) {
    this._walkSpeed = 1;
    this._sprintSpeed = 2.5;
  }

  setControls(): void {
    const setPick = this._setPick.bind(
      this,
      this.camera,
      this.scene,
      this.hand
    );

    this._observer(this.camera, this.scene, this.hand);

    this.scene.registerBeforeRender(function () {
      setPick();
    });
  }

  private _observer(
    camera: UniversalCamera,
    scene: Scene,
    hand: TransformNode
  ): void {
    const observer = scene.onKeyboardObservable.add((event) => {
      this._setMovement(event, camera, scene);
      this._drop(hand, event);
    });
  }

  private _setMovement(
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
      camera.speed = this._sprintSpeed;
    } else if (event.type === 2) camera.speed = this._walkSpeed;

    // if (evt.event.code === "KeyW") body.position.z += 0.1 * this.speed;
    // if (evt.event.code === "KeyS") body.position.z -= 0.1 * this.speed;
    // if (evt.event.code === "KeyA") body.position.x -= 0.1 * this.speed;
    // if (evt.event.code === "KeyD") body.position.x += 0.1 * this.speed;
  }

  private _drop(hand: TransformNode, event: KeyboardInfo): void {
    if (
      event.type === 2 &&
      event.event.code === "KeyE" &&
      hand.getChildMeshes()[0].getChildMeshes().length > 0
    ) {
      hand
        .getChildMeshes()[0]
        .removeChild(hand.getChildMeshes()[0].getChildMeshes()[0]);
    } else return;
  }

  private _setPick(
    camera: UniversalCamera,
    scene: Scene,
    hand: TransformNode
  ): void {
    function vecToLocal(vector: Vector3, mesh: UniversalCamera): Vector3 {
      const m = mesh.getWorldMatrix();
      const v = Vector3.TransformCoordinates(vector, m);
      return v;
    }

    function predicate(mesh: Mesh): boolean {
      //??
      if (
        mesh.name == "box" ||
        mesh.name == "ground" ||
        mesh.isPickable === false
      ) {
        return false;
      }
      return true;
    }

    const origin = camera.position;

    let forward = new Vector3(0, 0, 1);
    forward = vecToLocal(forward, camera);

    let direction = forward.subtract(origin);
    direction = Vector3.Normalize(direction);

    const length = 3;

    const ray = new Ray(origin, direction, length);

    const hit = scene.pickWithRay(ray, predicate);

    //const hl = new HighlightLayer("hl1", scene);

    if (hit.pickedMesh) {
      // hl.addMesh(
      //   //??
      //   hit.pickedMesh,
      //   Color3.Green()
      // );
      scene.onKeyboardObservable.addOnce((evt) => {
        if (
          evt.type === 2 &&
          evt.event.code === "KeyE" &&
          hand.getChildMeshes()[0].getChildMeshes().length == 0
        ) {
          hand.getChildMeshes()[0].addChild(hit.pickedMesh);
          hit.pickedMesh.position.x = hand.position.x - 50;
          hit.pickedMesh.position.y = hand.position.y + 40;
          hit.pickedMesh.position.z = hand.position.z - 30;
          hit.pickedMesh.rotation = new Vector3(0, 1.7, 1);
        }
      });
    }
  }
}
