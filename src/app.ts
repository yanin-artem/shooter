import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import MainScene from './scene/scene';

const canvas = document.querySelector('canvas')!;

new MainScene(canvas).CreateScene();

console.log('hello world')