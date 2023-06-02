export default class characterStatus {
  protected walkAcceleration: number;
  protected runAcceleration: number;
  protected mass: number;
  //коэффицент для максимального ускорения
  protected maxAccelerationK: number;
  //коэффицент трения
  protected slowdownK: number;
  protected jumpAcceleration: number;
  protected g: number;
  protected airResistance: number;
  constructor() {
    this.walkAcceleration = 0.2;
    this.runAcceleration = 0.7;
    this.mass = 60;
    //коэф замедления
    this.slowdownK = 0.1;
    this.jumpAcceleration = 10;
    this.maxAccelerationK = 0.5;
    this.g = 9.81;
    this.airResistance = 0.001;
  }
}
