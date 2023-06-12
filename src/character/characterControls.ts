export default class ControllEvents {
  public forward = false;
  public right = false;
  public back = false;
  public left = false;
  public run = false;
  public jump = false;
  public pick = false;
  public drop = true;
  public takeApart = false;

  public handleControlEvents(event) {
    if (event.event.code === "KeyW") this.forward = event.type === 1;
    if (event.event.code === "KeyS") this.back = event.type === 1;
    if (event.event.code === "KeyD") this.right = event.type === 1;
    if (event.event.code === "KeyA") this.left = event.type === 1;
    if (event.event.code === "ShiftLeft") this.run = event.type === 1;
    if (event.event.code === "Space") this.jump = event.type === 1;
    // if (event.event.code === "KeyE") this.pick = true;
    // if (event.event.code === "KeyE" && event.type === 1) this.drop = true;
    if (event.event.button === 0) this.takeApart = event.type === 1;
  }
}
