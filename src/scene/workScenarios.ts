import {
  AbstractMesh,
  PickingInfo,
  Scene,
  Animation,
  PhysicsMotionType,
  Vector3,
} from "@babylonjs/core";
import { Inventory } from "../character/inventory/inventory";
import { QuickAccess } from "../character/inventory/quickAccess";
import rayCast from "../character/rayCast";
import LocationMeshes from "./locationMeshes";
import ControllEvents from "../character/characterControls";
import { Instruments } from "../character/instruments.ts/instruments";
import { BigInstruments } from "../character/instruments.ts/bigInstruments";
import Hands from "../character/hands";

export default class WorkScenarios {
  private location: LocationMeshes;

  constructor(
    private inventory: Inventory,
    private quickAccess: QuickAccess,
    private raycast: rayCast,
    private scene: Scene,
    private body: AbstractMesh,
    private constrols: ControllEvents,
    private instruments: Instruments,
    private bigInstruments: BigInstruments,
    private hands: Hands,
    private pickedItem: AbstractMesh
  ) {
    this.location = LocationMeshes.Instance(this.scene);
    this.rayCastEvents();
  }

  private rayCastEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      this.raycast.doItemAction(this.openCover.bind(this));
      this.raycast.doItemAction(this.unscrewTheCap.bind(this));
      this.raycast.doItemAction(this.hookGaugeManiford.bind(this));
      this.raycast.doItemAction(this.connectRedWire.bind(this));
      this.raycast.doItemAction(this.connectBlueWire.bind(this));
      this.raycast.pickPlacementArea(this.placementFreonEvacuator.bind(this));
      this.raycast.pickDoorToHouseLocation(this.goToHomeLocation.bind(this));
      this.raycast.pickDoorToWorkshopLocation(
        this.location.disposeHomeLocation.bind(this.location)
      );
    });
    this.scene.onPointerObservable.add((event) => {
      this.constrols.handleMouseEvents(event);
      this.raycast.rotateInstrumentPart(this.rotateInstrumentPart.bind(this));
    });
  }

  private checkInstruments(instruments: number[]) {
    const needfulInstruments = instruments.reduce((acc, id) => {
      const haveInInventory = this.inventory.inventory.find(
        (item) => item.id === id
      );
      const haveInQuickAccess = this.quickAccess.quickAccess.find(
        (item) => item.id === id
      );
      if (haveInInventory || haveInQuickAccess) return acc + 1;
      else return acc;
    }, 0);

    if (instruments.length === needfulInstruments) {
      return true;
    } else {
      alert("Возьмите недостающие инструменты!");
      return false;
    }
  }

  private pumpingOutFreonCheckInstruments() {
    const instruments = [1, 32];
    return this.checkInstruments(instruments);
  }

  private async goToHomeLocation() {
    if (this.pumpingOutFreonCheckInstruments())
      await this.location.CreateHouseLocation(this.body);
  }

  private openCover(hit: PickingInfo) {
    const screwdriverID = 1;
    if (
      this.quickAccess.isInQuickAccess(screwdriverID)?.isEnabled &&
      hit.pickedMesh.metadata.id === 2
    ) {
      hit.pickedMesh.dispose();
    }
  }

  private unscrewTheCap(hit: PickingInfo) {
    const pliersID = 32;
    if (
      (this.quickAccess.isInQuickAccess(pliersID)?.isEnabled &&
        hit.pickedMesh.metadata.id === 29) ||
      hit.pickedMesh.metadata.id === 30
    ) {
      hit.pickedMesh.rotationQuaternion = null;
      const frameRate = 10;

      const xSlide = new Animation(
        "xSlide",
        "rotation.y",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );

      const keyFrames = [];

      keyFrames.push({
        frame: 0,
        value: 0,
      });

      keyFrames.push({
        frame: frameRate,
        value: 5,
      });

      keyFrames.push({
        frame: 2 * frameRate,
        value: 10,
      });

      xSlide.setKeys(keyFrames);

      hit.pickedMesh.animations.push(xSlide);

      const anim = this.scene.beginAnimation(
        hit.pickedMesh,
        0,
        2 * frameRate,
        true
      );
      const timeout = setTimeout(() => {
        anim.stop();
        hit.pickedMesh.isVisible = false;
        clearTimeout(timeout);
      }, 3000);
    }
  }

  private hookGaugeManiford(hit: PickingInfo) {
    const gaugeManifordId = 75;
    if (this.quickAccess.isInQuickAccess(gaugeManifordId)?.isEnabled) {
      const gaugeManiford = this.bigInstruments.getByID(gaugeManifordId);
      this.hands.dropBigItem(gaugeManiford.picableMeshes[0]);
      // this.pickedItem.physicsBody.setMotionType(PhysicsMotionType.STATIC);
      gaugeManiford.picableMeshes[0].rotationQuaternion = null;
      gaugeManiford.picableMeshes[0].rotation.set(Math.PI / 2, Math.PI / 2, 0);
      gaugeManiford.picableMeshes[0].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      gaugeManiford.picableMeshes[0].position.set(-3.303, 5.483, -5.627);
      this.quickAccess.deleteFromQuickAccessAndFromHand(gaugeManiford.id);
      this.pickedItem = null;
    }
  }

  private connectRedWire(hit: PickingInfo) {
    const redWireId = 71;
    const gaugeManifordId = 75;
    if (
      this.quickAccess.isInQuickAccess(redWireId)?.isEnabled &&
      hit.pickedMesh.metadata.id === 30
    ) {
      const redWire = this.bigInstruments.getByID(redWireId);
      this.hands.dropBigItem(redWire.picableMeshes[0]);
      // this.pickedItem.physicsBody.setMotionType(PhysicsMotionType.STATIC);
      redWire.picableMeshes[0].rotationQuaternion = null;
      redWire.picableMeshes[0].rotation.set(Math.PI / 2, 0, 0);
      redWire.picableMeshes[0].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      redWire.picableMeshes[0].position = hit.pickedMesh.getAbsolutePosition();
      redWire.picableMeshes[1].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      redWire.picableMeshes[1].rotationQuaternion = null;
      redWire.picableMeshes[1].rotation.set(Math.PI / 2, 0, 0);
      redWire.picableMeshes[1].position.set(-3.303, 5.42, -5.659);

      this.quickAccess.deleteFromQuickAccessAndFromHand(redWire.id);
      this.pickedItem = null;
    }
  }

  private connectBlueWire(hit: PickingInfo) {
    const blueWireId = 72;
    const gaugeManifordId = 75;
    if (
      this.quickAccess.isInQuickAccess(blueWireId)?.isEnabled &&
      hit.pickedMesh.metadata.id === 29
    ) {
      const blueWire = this.bigInstruments.getByID(blueWireId);
      this.hands.dropBigItem(blueWire.picableMeshes[0]);
      // this.pickedItem.physicsBody.setMotionType(PhysicsMotionType.STATIC);
      blueWire.picableMeshes[0].rotationQuaternion = null;
      blueWire.picableMeshes[0].rotation.set(Math.PI / 2, 0, 0);
      blueWire.picableMeshes[0].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      blueWire.picableMeshes[0].position = hit.pickedMesh.getAbsolutePosition();
      blueWire.picableMeshes[1].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      const gaugeManiford = this.bigInstruments.getByID(gaugeManifordId);

      blueWire.picableMeshes[1].position.set(-3.303, 5.419, -5.6);
      blueWire.picableMeshes[1].rotationQuaternion = null;
      blueWire.picableMeshes[1].rotation.set(Math.PI / 2, 0, 0);

      this.quickAccess.deleteFromQuickAccessAndFromHand(blueWire.id);
      this.pickedItem = null;
    }
  }

  private placementFreonEvacuator(hit: PickingInfo) {
    const greyWireId = 73;
    const secondGreyWireId = 77;
    const freonEvacuatorId = 74;
    if (
      this.quickAccess.isInQuickAccess(greyWireId) &&
      this.quickAccess.isInQuickAccess(secondGreyWireId) &&
      this.quickAccess.isInQuickAccess(freonEvacuatorId)?.isEnabled
    ) {
      const greyWire = this.bigInstruments.getByID(greyWireId);
      const secondGreyWire = this.bigInstruments.getByID(secondGreyWireId);
      const freonEvacuator = this.bigInstruments.getByID(freonEvacuatorId);

      this.hands.dropBigItem(greyWire.picableMeshes[0]);
      this.hands.dropBigItem(secondGreyWire.picableMeshes[0]);
      this.hands.dropBigItem(freonEvacuator.picableMeshes[0]);

      freonEvacuator.picableMeshes[0].physicsBody.dispose();
      freonEvacuator.picableMeshes[0].position.set(-3.009, 4.359, -4.793);
      freonEvacuator.picableMeshes[0].rotationQuaternion = null;
      freonEvacuator.picableMeshes[0].rotation.set(0, Math.PI, -Math.PI);

      greyWire.picableMeshes[0].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      greyWire.picableMeshes[0].rotationQuaternion =
        freonEvacuator.picableMeshes[0].rotationQuaternion;
      const greyWirePosition = freonEvacuator.meshes[6].getAbsolutePosition();
      greyWire.picableMeshes[0].position = greyWirePosition;

      greyWire.picableMeshes[1].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      greyWire.picableMeshes[1].position.set(-3.303, 5.419, -5.6);
      greyWire.picableMeshes[1].rotationQuaternion = null;
      greyWire.picableMeshes[1].rotation.set(Math.PI / 2, 0, 0);

      secondGreyWire.picableMeshes[0].physicsBody.setMotionType(
        PhysicsMotionType.STATIC
      );
      secondGreyWire.picableMeshes[0].rotationQuaternion =
        freonEvacuator.picableMeshes[0].rotationQuaternion;
      const secondGreyWirePosition =
        freonEvacuator.meshes[5].getAbsolutePosition();
      secondGreyWire.picableMeshes[0].position = secondGreyWirePosition;

      secondGreyWire.picableMeshes[1].physicsBody.setMotionType(
        PhysicsMotionType.DYNAMIC
      );

      this.quickAccess.deleteFromQuickAccessAndFromHand(greyWire.id);
      this.quickAccess.deleteFromQuickAccessAndFromHand(secondGreyWire.id);
      this.quickAccess.deleteFromQuickAccessAndFromHand(freonEvacuator.id);

      this.pickedItem = null;
    }
  }

  private rotateInstrumentPart(hit: PickingInfo, rotationK: number) {
    hit.pickedMesh.rotationQuaternion = null;
    hit.pickedMesh.rotation.x -= rotationK / 1000;
  }
}
