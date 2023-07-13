import { AbstractMesh, SceneLoader, Vector3 } from "@babylonjs/core";

export type instrument = {
  id: number;
  name: string;
  imageSrc: string;
  description: string;
  mesh: AbstractMesh;
  isActive: boolean;
  filename: string;
  position: Vector3;
  rotation: Vector3;
};

import { instruments } from "./instrumentsList";

export class Instruments {
  private instruments: Array<instrument>;
  constructor() {
    this.instruments = instruments;
    this.createInstrumentsMeshes();
  }

  private createInstrumentsMeshes() {
    this.instruments.forEach((instrument) => {
      SceneLoader.ImportMeshAsync(
        "",
        "../assets/models/workshop/",
        instrument.filename + ".glb"
      ).then((meshes) => {
        const mesh = meshes.meshes[1];
        const root = mesh.parent;
        mesh.setParent(null);
        root.dispose();
        mesh.name = instrument.filename;
        const screwdriverHitbox = mesh.clone(
          `${instrument.filename}Hitbox`,
          mesh
        );
        screwdriverHitbox.position = Vector3.Zero();
        screwdriverHitbox.scaling.scaleInPlace(2);
        screwdriverHitbox.isVisible = false;

        mesh.metadata = {
          isItem: true,
          isConditioner: false,
          id: instrument.id,
        };
        mesh.getChildMeshes()[0].metadata = {
          isItem: true,
          isConditioner: false,
          id: instrument.id,
        };
        instrument.mesh = mesh;
      });
    });
  }

  public getByID(index: number) {
    return instruments[index];
  }

  public static isInstrument(mesh: AbstractMesh) {
    const item = instruments.find((item) => item.id === mesh.metadata.id);
    return mesh.metadata.isItem && mesh.isEnabled() && !item.isActive;
  }
}
