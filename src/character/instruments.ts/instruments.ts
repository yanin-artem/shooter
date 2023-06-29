import Screwdriver from "./screwdriver";
import Pliers from "./pliers";
import Scissors from "./scissors";
//TODO: КАКОЙ-ТО БАГ С АЙДИШНИКАМИ

export default class Instruments {
  public screwdriver: Screwdriver;
  public pliers: Pliers;
  public scissors: Scissors;
  public storage: Array<any>;
  constructor() {
    this.screwdriver = new Screwdriver();
    this.pliers = new Pliers();
    this.scissors = new Scissors();
    this.storage = this.createInstrumentsStorage();
  }
  private createInstrumentsStorage(): Array<any> {
    const storage = [];
    storage.push(this.screwdriver);
    storage.push(this.pliers);
    storage.push(this.scissors);
    return storage;
  }
}
