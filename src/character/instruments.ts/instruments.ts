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
import { AbstractMesh, Scene } from "@babylonjs/core";
import ControllEvents from "../characterControls";
import Instrument from "./instrument";

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
  constructor(
    private scene: Scene,
    private head: AbstractMesh,
    private controls: ControllEvents
  ) {
    this.screwdriver = new Screwdriver(this.scene, this.head, this.controls);
    this.pliers = new Pliers(this.scene, this.head, this.controls);
    this.scissors = new Scissors(this.scene, this.head, this.controls);
    this.wrench = new Wrench(this.scene, this.head, this.controls);
    this.pipeExpander = new PipeExpander(this.scene, this.head, this.controls);
    this.leakDetector = new LeakDetecor(this.scene, this.head, this.controls);
    this.leverPipeExpander = new LeverPipeExpander(
      this.scene,
      this.head,
      this.controls
    );
    this.pipeBenderCrossbow = new PipeBenderCrossbow(
      this.scene,
      this.head,
      this.controls
    );
    this.pipeBenderCrossbowNozzle = new PipeBenderCrossbowNozzle(
      this.scene,
      this.head,
      this.controls
    );
    this.pipeBenderSpring = new PipeBenderSpring(
      this.scene,
      this.head,
      this.controls
    );
    this.pipeCutterBig = new PipeCutterBig(
      this.scene,
      this.head,
      this.controls
    );
    this.pipeCutterSmall = new PipeCutterSmall(
      this.scene,
      this.head,
      this.controls
    );
    this.rimmerBarrel = new RimmerBarrel(this.scene, this.head, this.controls);
    this.rimmerPencil = new RimmerPencil(this.scene, this.head, this.controls);
    this.rolling = new Rolling(this.scene, this.head, this.controls);
    this.torqueWrench = new TorqueWrench(this.scene, this.head, this.controls);
    this.torqueWrenchNozzle = new TorqueWrenchNozzle(
      this.scene,
      this.head,
      this.controls
    );
    this.screwdriverIndicator = new ScrewdriverIndicator(
      this.scene,
      this.head,
      this.controls
    );
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

  public getById(id: number): Instrument {
    return this.storage.find((instrument) => instrument.id === id);
  }
}
