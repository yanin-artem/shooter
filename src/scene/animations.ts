import { Animation, UniversalCamera } from "@babylonjs/core";

export function jump(camera: UniversalCamera) {
  const fstFrame = 0;
  const finalFrame = 10;
  const frameRate = 60;

  const jump = new Animation(
    "jump",
    "position.y",
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keyFrames = [];

  keyFrames.push({
    frame: fstFrame,
    value: camera.position.y,
  });

  keyFrames.push({
    frame: finalFrame,
    value: camera.position.y + 0.6,
  });

  jump.setKeys(keyFrames);

  camera.animations.push(jump);

  return { fstFrame, finalFrame };
}
