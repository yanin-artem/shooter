import {
  Scene,
  Engine,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  UniversalCamera,
} from '@babylonjs/core';

export default class MainScene {
  scene: Scene;
  engine: Engine;

  constructor(private canvas: HTMLCanvasElement) {
    this.engine = new Engine(this.canvas, true);
    this.scene = this.CreateScene();

    this.CreateMeshes();

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  CreateScene(): Scene {
    const scene = new Scene(this.engine);

    const hemiLight = new HemisphericLight(
      'hemiLight',
      new Vector3(0, 1, 0),
      this.scene
    );

    hemiLight.intensity = 0.5;

    const framesPerSecond = 60;
    const gravity = -9.81;
    scene.gravity = new Vector3(0,gravity/framesPerSecond,0);
    scene.collisionsEnabled = true;

    return scene;
  }

    CreateMeshes():void{
    const ground = MeshBuilder.CreateBox('ground',{ width: 20, height: 1, depth: 20 },this.scene)
    const box = MeshBuilder.CreateBox('box',{ width: 3, height: 3, depth: 3 },this.scene)
    box.position = new Vector3(0,2,7)
    
    //???
    this.scene.meshes.map((mesh)=>{
        mesh.checkCollisions = true;
    })
  }

  CreateController(): UniversalCamera {
    const camera = new UniversalCamera(
      'camera',
      new Vector3(0,3,0),
      this.scene
    );

    camera.attachControl();

    this.scene.onPointerDown = () => {
        if(!this.engine.isPointerLock) this.engine.enterPointerlock();
    }

    camera.applyGravity = true;
    camera.checkCollisions = true;

    camera.ellipsoid = new Vector3(0.4, 0.8, 0.4);

    camera.minZ = 0.45;
    camera.speed = 0.75;
    camera.inertia = 0;
    camera.angularSensibility = 600;

    return camera;
  }
}
