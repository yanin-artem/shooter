export default class characterStatus {
  protected walkBoost: number;
  protected runBoost: number;
  protected mass: number;
  //коэффицент для максимального ускорения
  protected maxBoostK: number;
  //коэффицент трения
  protected friсtionK: number;
  protected jumpBoost: number;
  protected g: number;
  protected airResistance: number;
  constructor() {
    this.walkBoost = 0.2;
    this.runBoost = 0.7;
    this.mass = 60;
    this.friсtionK = 0.1;
    this.jumpBoost = 10;
    this.maxBoostK = 10;
    this.g = 9.81;
    this.airResistance = 20;
  }
}
