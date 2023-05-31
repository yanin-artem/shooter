export default class characterStatus {
  protected walkBoost: number;
  protected runBoost: number;
  protected mass: number;
  protected maxBoost: number;
  protected friсtion: number;
  constructor() {
    this.walkBoost = 0.2;
    this.runBoost = 0.7;
    this.mass = 60;
    this.maxBoost = 0;
    this.friсtion = 0.1;
  }
}
