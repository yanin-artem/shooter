export default class ControllEvents {
  public forward = false;
  public right = false;
  public back = false;
  public left = false;
  public run = false;
  public jump = false;
  public pick = false;
  public drop = false;
  public takeApart = false;

  public handleControlEvents(event) {
    if (event.event.code === "KeyW") this.forward = event.type === 1;
    if (event.event.code === "KeyS") this.back = event.type === 1;
    if (event.event.code === "KeyD") this.right = event.type === 1;
    if (event.event.code === "KeyA") this.left = event.type === 1;
    if (event.event.code === "ShiftLeft") this.run = event.type === 1;
    if (event.event.code === "Space") this.jump = event.type === 1;
    if (event.event.code === "KeyG") this.pick = event.type === 1;
    if (event.event.code === "KeyT") this.drop = event.type === 1;
    if (event.event.code === "KeyF") this.takeApart = event.type === 1;
  }
}
