import {
  Vector3,
  UniversalCamera,
  Scene,
  Ray,
  Mesh,
  MeshAssetTask,
  TransformNode,
} from "@babylonjs/core";

import { jump } from "./animations";

export default class Controls {
  walkSpeed: number;
  sprintSpeed: number;
  speed: number;

  constructor(
    private camera: UniversalCamera,
    private body: Mesh,
    private hand: TransformNode,
    private scene: Scene
  ) {
    this.walkSpeed = 1;
    this.sprintSpeed = 2.5;
    this.speed = this.walkSpeed;

    this.setControls();
  }

  setControls(): void {
    this.setMovement(this.camera, this.scene);
    const setPick = this.setPick.bind(this, this.camera, this.scene);

    this.scene.registerBeforeRender(function () {
      setPick();
    });
  }

  setMovement(camera: UniversalCamera, scene: Scene): void {
    camera.keysUp.push(87);
    camera.keysLeft.push(65);
    camera.keysDown.push(83);
    camera.keysRight.push(68);

    const animationFrames = jump(camera);

    const observer = scene.onKeyboardObservable.add((evt) => {
      if (evt.type === 2 && evt.event.code === "Space") {
        scene.beginAnimation(
          camera,
          animationFrames.fstFrame,
          animationFrames.finFrame,
          false
        );
        console.log(camera.position.y);
      }

      if (evt.type === 1 && evt.event.code === "ShiftLeft") {
        camera.speed = this.sprintSpeed;
      } else if (evt.type === 2) camera.speed = this.walkSpeed;

      if (
        evt.type === 2 &&
        evt.event.code === "KeyE" &&
        this.hand.getChildMeshes()[0].getChildMeshes().length > 0
      ) {
        this.hand
          .getChildMeshes()[0]
          .removeChild(this.hand.getChildMeshes()[0].getChildMeshes()[0]);
      }
      // if (evt.event.code === "KeyW") body.position.z += 0.1 * this.speed;
      // if (evt.event.code === "KeyS") body.position.z -= 0.1 * this.speed;
      // if (evt.event.code === "KeyA") body.position.x -= 0.1 * this.speed;
      // if (evt.event.code === "KeyD") body.position.x += 0.1 * this.speed;
    });
  }

  setPick(camera: UniversalCamera, scene: Scene): void {
    function vecToLocal(vector, mesh) {
      const m = mesh.getWorldMatrix();
      const v = Vector3.TransformCoordinates(vector, m);
      return v;
    }

    function predicate(mesh) {
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
          this.hand.getChildMeshes()[0].getChildMeshes().length == 0
        ) {
          this.hand.getChildMeshes()[0].addChild(hit.pickedMesh);
          hit.pickedMesh.position.x = this.hand.position.x - 50;
          hit.pickedMesh.position.y = this.hand.position.y + 40;
          hit.pickedMesh.position.z = this.hand.position.z - 30;
          hit.pickedMesh.rotation = new Vector3(0, 1.7, 1);
        }
      });
    }
  }
}
