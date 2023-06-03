export default class characterStatus {
  protected walkAcceleration: number;
  protected runAcceleration: number;
  protected walkMaxSpeed: number;
  protected runMaxSpeed: number;
  protected mass: number;
  //коэффицент трения
  protected slowdownK: number;
  protected jumpSpeed: number;
  protected gravity: number;
  protected airResistance: number;
  protected jumpHeight: number;
  constructor() {
    this.walkAcceleration = 0.2;
    this.runAcceleration = 0.7;
    this.mass = 60;
    this.walkMaxSpeed = 0.1;
    this.runMaxSpeed = 0.3;
    //коэф замедления
    this.slowdownK = 0.1;
    this.jumpSpeed = 0.5;
    this.jumpHeight = 2;
    this.gravity = 9.81;
    this.airResistance = 0.1;
  }
}
