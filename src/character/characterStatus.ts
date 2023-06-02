export default class characterStatus {
  protected walkAcceleration: number;
  protected runAcceleration: number;
  protected walkMaxSpeed: number;
  protected runMaxSpeed: number;
  protected mass: number;
  //коэффицент трения
  protected slowdownK: number;
  protected jumpAcceleration: number;
  protected g: number;
  protected airResistance: number;
  constructor() {
    this.walkAcceleration = 0.2;
    this.runAcceleration = 0.7;
    this.mass = 60;
    this.walkMaxSpeed = 0.1;
    this.runMaxSpeed = 0.3;
    //коэф замедления
    this.slowdownK = 0.1;
    this.jumpAcceleration = 2;

    this.g = 9.81;
    this.airResistance = 0.1;
  }
}
