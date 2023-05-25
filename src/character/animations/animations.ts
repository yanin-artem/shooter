import { Animation, UniversalCamera } from "@babylonjs/core";

export function jump(camera: UniversalCamera) {
  const fstFrame = 0;
  const midFrame = 38;
  const finFrame = 60;
  const frameRate = 60;

  const jump = new Animation(
    "jump",
    "position.y",
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE,
    false
  );

  const keyFrames = [];
  keyFrames.push({
    frame: fstFrame,
    value: camera.position.y,
  });

  keyFrames.push({
    frame: midFrame,
    value: camera.position.y + 3,
  });

  keyFrames.push({
    frame: finFrame,
    value: camera.position.y,
  });

  jump.setKeys(keyFrames);
  jump.blendingSpeed = 0.01;

  camera.animations.push(jump);

  return { fstFrame, finFrame };
}
