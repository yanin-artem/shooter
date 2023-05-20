import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import MainScene from "./scene/scene";
import Controls from "./scene/controls";

const canvas = document.querySelector("canvas")!;

const scene = new MainScene(canvas);

const controls = new Controls(scene.CreateController(), scene.scene);
