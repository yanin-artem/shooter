import { AbstractMesh, Scene, SceneLoader, Vector3 } from "@babylonjs/core";

export type bigInstruments = {
  id: number;
  name: string;
  imageSrc: string;
  description: string;
  picableMeshes: AbstractMesh[];
  meshes: AbstractMesh[];
  isActive: boolean;
  filename: string;
  position: Vector3;
  rotation: Vector3;
};

import Wires from "./wires";
import FreonEvacuator from "./freonEvacuator";
import GaugeManiford from "./gaugeManiford";
import Ballon from "./ballon";

export class BigInstruments {
  private bigInstruments: Array<bigInstruments>;
  private wires: Wires;
  private freonEvacuator: FreonEvacuator;
  private gaugeManiford: GaugeManiford;
  private ballon: Ballon;
  constructor(private scene: Scene) {
    this.bigInstruments = [];
    this.wires = new Wires(this.scene);
    this.addInstrument(this.wires.redWire);
    this.addInstrument(this.wires.blueWire);
    this.addInstrument(this.wires.greywWire);
    this.freonEvacuator = new FreonEvacuator(this.scene);
    this.addInstrument(this.freonEvacuator.freonEvacuator);
    this.gaugeManiford = new GaugeManiford(this.scene);
    this.addInstrument(this.gaugeManiford.gaugeManiford);
    this.ballon = new Ballon(this.scene);
    this.addInstrument(this.ballon.ballon);
  }

  public getByID(index: number) {
    return this.bigInstruments[index - 70];
  }

  public addInstrument(instrument: bigInstruments) {
    this.bigInstruments.push(instrument);
  }

  //   public static isInstrument(mesh: AbstractMesh) {
  //     const item = this.bigInstruments.find((item) => item.id === mesh.metadata.id);
  //     return mesh.metadata.isItem && mesh.isEnabled() && !item?.isActive;
  //   }
}
