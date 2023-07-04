import Screwdriver from "./screwdriver";
import Pliers from "./pliers";
import Scissors from "./scissors";
import Wrench from "./wrench";
import PipeExpander from "./pipeExpander";
import LeakDetecor from "./leakDetector";
import LeverPipeExpander from "./leverPipeExpander";
import PipeBenderCrossbow from "./pipeBenderCrossbow";
import PipeBenderCrossbowNozzle from "./pipeBenderCrossbowNozzle";
import PipeBenderSpring from "./pipeBenderSpring";
import PipeCutterBig from "./pipeCutterBig";
import PipeCutterSmall from "./pipeCutterSmall";
import RimmerBarrel from "./rimmerBarrel";
import RimmerPencil from "./rimmerPencil";
import Rolling from "./rolling";
import TorqueWrench from "./torqueWrench";
import TorqueWrenchNozzle from "./TorqueWrenchNozzle";
import ScrewdriverIndicator from "./screwdriverIndicator";

//TODO: КАКОЙ-ТО БАГ С АЙДИШНИКАМИ

export default class Instruments {
  public screwdriver: Screwdriver;
  public pliers: Pliers;
  public scissors: Scissors;
  public wrench: Wrench;
  public pipeExpander: PipeExpander;
  public leakDetector: LeakDetecor;
  public leverPipeExpander: LeverPipeExpander;
  public pipeBenderCrossbow: PipeBenderCrossbow;
  public pipeBenderCrossbowNozzle: PipeBenderCrossbowNozzle;
  public pipeBenderSpring: PipeBenderSpring;
  public pipeCutterBig: PipeCutterBig;
  public pipeCutterSmall: PipeCutterSmall;
  public rimmerBarrel: RimmerBarrel;
  public rimmerPencil: RimmerPencil;
  public rolling: Rolling;
  public torqueWrench: TorqueWrench;
  public torqueWrenchNozzle: TorqueWrenchNozzle;
  public screwdriverIndicator: ScrewdriverIndicator;

  public storage: Array<any>;
  constructor() {
    this.screwdriver = new Screwdriver();
    this.pliers = new Pliers();
    this.scissors = new Scissors();
    this.wrench = new Wrench();
    this.pipeExpander = new PipeExpander();
    this.leakDetector = new LeakDetecor();
    this.leverPipeExpander = new LeverPipeExpander();
    this.pipeBenderCrossbow = new PipeBenderCrossbow();
    this.pipeBenderCrossbowNozzle = new PipeBenderCrossbowNozzle();
    this.pipeBenderSpring = new PipeBenderSpring();
    this.pipeCutterBig = new PipeCutterBig();
    this.pipeCutterSmall = new PipeCutterSmall();
    this.rimmerBarrel = new RimmerBarrel();
    this.rimmerPencil = new RimmerPencil();
    this.rolling = new Rolling();
    this.torqueWrench = new TorqueWrench();
    this.torqueWrenchNozzle = new TorqueWrenchNozzle();
    this.screwdriverIndicator = new ScrewdriverIndicator();
    this.storage = this.createInstrumentsStorage();
    console.log(this.storage);
  }
  private createInstrumentsStorage(): Array<any> {
    const storage = [];
    storage.push(this.screwdriver);
    storage.push(this.pliers);
    storage.push(this.scissors);
    storage.push(this.wrench);
    storage.push(this.pipeExpander);
    storage.push(this.leakDetector);
    storage.push(this.leverPipeExpander);
    storage.push(this.pipeBenderCrossbow);
    storage.push(this.pipeBenderCrossbowNozzle);
    storage.push(this.pipeBenderSpring);
    storage.push(this.pipeCutterBig);
    storage.push(this.pipeCutterSmall);
    storage.push(this.rimmerBarrel);
    storage.push(this.rimmerPencil);
    storage.push(this.rolling);
    storage.push(this.torqueWrench);
    storage.push(this.torqueWrenchNozzle);
    storage.push(this.screwdriverIndicator);
    return storage;
  }

  public getById(id: number) {
    return this.storage.find((instrument) => instrument.id === id);
  }
}
