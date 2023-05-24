import MainScene from "./scene/scene";
import Controls from "./scene/controls";

const canvas = document.querySelector("canvas")!;

const scene = new MainScene(canvas);

const controls = new Controls(scene.camera, scene.body, scene.scene);
