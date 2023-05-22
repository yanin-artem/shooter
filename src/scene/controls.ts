import {
  Vector3,
  UniversalCamera,
  Scene,
  Ray,
  StandardMaterial,
  Color3,
} from "@babylonjs/core";

export default class Controls {
  walkSpeed: number;
  sprintSpeed: number;

  constructor(private camera: UniversalCamera, private scene: Scene) {
    this.walkSpeed = 0.75;
    this.sprintSpeed = 2.5;

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

    const observer = scene.onKeyboardObservable.add((evt) => {
      //   // if(evt.type===2 && evt.event.code ==='Space'){
      //   //     camera.cameraDirection.y += 1;
      //   // }

      if (evt.type === 1 && evt.event.code === "ShiftLeft") {
        camera.speed = this.sprintSpeed;
        console.log(camera);
      } else if (evt.type === 2) camera.speed = this.walkSpeed;
    });
  }

  setPick(camera: UniversalCamera, scene: Scene): void {
    function vecToLocal(vector, mesh) {
      var m = mesh.getWorldMatrix();
      var v = Vector3.TransformCoordinates(vector, m);
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
        if (evt.type === 2 && evt.event.code === "KeyE") {
          hit.pickedMesh.dispose();
        }
      });
    }
  }
}
