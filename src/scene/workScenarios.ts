import {
  AbstractMesh,
  PickingInfo,
  Scene,
  Animation,
  PhysicsMotionType,
  Vector3,
  Sound,
  Axis,
} from "@babylonjs/core";
import { Inventory } from "../character/inventory/inventory";
import { QuickAccess } from "../character/inventory/quickAccess";
import rayCast from "../character/rayCast";
import LocationMeshes from "./locationMeshes";
import ControllEvents from "../character/characterControls";
import { Instruments } from "../character/instruments.ts/instruments";
import { BigInstruments } from "../character/instruments.ts/bigInstruments";
import Hands from "../character/hands";

const enum scenarios {
  goToLocation,
  prepareToWork,
  unscrewTheCaps,
  connectRedAndBlueWires,
  placementFreonEvacuator,
  gaugeManifordManipulations,
  letOffTheGas,
  placementBallon,
  prepareFreonEvacuatorWork,
  firstStart,
  freonEvacuatorToRecoverFast,
  secondStart,
  freonEvacuatorToPurge,
  thirdStart,
  freonEvacuatorToDown,
}

export default class WorkScenarios {
  private location: LocationMeshes;
  private gasSound: Sound;
  private freonEvacuatorSound: Sound;
  private scenariosStep = 0;
  private openCoverIndicator = false;
  private hookManifordIndicator = false;
  //эта переменная нужна для шагов в которых требуется два действия
  private doubleStepsCounter = 0;

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
    this.gasSound = new Sound(
      "gasSound",
      "../assets/sounds/gas.mp3",
      this.scene
    );
    this.freonEvacuatorSound = new Sound(
      "freonEvacuatorSound",
      "../assets/sounds/workingFreonEvacuator.mp3",
      this.scene
    );
    this.location = LocationMeshes.Instance(this.scene);
    this.rayCastEvents();
  }

  private rayCastEvents() {
    this.scene.onKeyboardObservable.add((event) => {
      console.log(this.scenariosStep);
      if (scenarios.goToLocation === this.scenariosStep)
        this.raycast.pickDoorToHouseLocation(this.goToHomeLocation.bind(this));
      if (scenarios.prepareToWork === this.scenariosStep) {
        this.raycast.doItemAction(this.openCover.bind(this));
        this.raycast.doItemAction(this.hookGaugeManiford.bind(this));
      }
      if (scenarios.unscrewTheCaps === this.scenariosStep) {
        this.raycast.doItemAction(this.unscrewTheCap.bind(this));
      }
      if (scenarios.connectRedAndBlueWires === this.scenariosStep) {
        this.raycast.doItemAction(this.connectRedWire.bind(this));
        this.raycast.doItemAction(this.connectBlueWire.bind(this));
      }
      if (scenarios.placementFreonEvacuator === this.scenariosStep) {
        this.raycast.pickPlacementArea(this.placementFreonEvacuator.bind(this));
      }
      if (scenarios.placementBallon === this.scenariosStep) {
        this.raycast.pickPlacementArea(this.placementBallon.bind(this));
      }
      if (scenarios.letOffTheGas === this.scenariosStep) {
        this.letOffTheGas();
      }
      this.raycast.pickButton(this.pullButton.bind(this));
      if (
        scenarios.firstStart === this.scenariosStep ||
        scenarios.secondStart === this.scenariosStep ||
        scenarios.thirdStart === this.scenariosStep
      ) {
        this.raycast.pickButton(this.StartFreonEvacuator.bind(this));
      }
      this.raycast.pickDoorToWorkshopLocation(
        this.location.disposeHomeLocation.bind(this.location)
      );
    });
    this.scene.onPointerObservable.add((event) => {
      this.constrols.handleMouseEvents(event);
      this.raycast.rotateInstrumentPart(this.rotateInstrumentPart.bind(this));
      if (scenarios.gaugeManifordManipulations === this.scenariosStep) {
        this.gaugeManifordManipulations();
      }
      if (scenarios.prepareFreonEvacuatorWork === this.scenariosStep) {
        this.prepareFreonEvacuatorWork();
      }
      if (scenarios.freonEvacuatorToRecoverFast === this.scenariosStep) {
        this.freonEvacuatorToRecoverFast();
      }
      if (scenarios.freonEvacuatorToPurge === this.scenariosStep) {
        this.freonEvacuatorToPurge();
      }
      if (scenarios.freonEvacuatorToDown === this.scenariosStep) {
        this.freonEvacuatorToDown();
      }
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
    this.scenariosStep++;
  }

  private openCover(hit: PickingInfo) {
    const screwdriverID = 1;
    if (
      this.quickAccess.isInQuickAccess(screwdriverID)?.isEnabled &&
      hit.pickedMesh.metadata.id === 2
    ) {
      hit.pickedMesh.dispose();
      this.openCoverIndicator = true;
      if (this.hookManifordIndicator) {
        this.scenariosStep++;
      }
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
      this.doubleStepsCounter++;
      if (this.doubleStepsCounter === 2) {
        this.scenariosStep++;
        this.doubleStepsCounter = 0;
      }
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
      this.hookManifordIndicator = true;
      if (this.openCoverIndicator) {
        this.scenariosStep++;
      }
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
      this.doubleStepsCounter++;
      if (this.doubleStepsCounter === 2) {
        this.scenariosStep++;
        this.doubleStepsCounter = 0;
      }
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
      this.doubleStepsCounter++;
      if (this.doubleStepsCounter === 2) {
        this.scenariosStep++;
        this.doubleStepsCounter = 0;
      }
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
        PhysicsMotionType.STATIC
      );

      secondGreyWire.picableMeshes[1].position.set(-3.728, 4.448, -4.808);

      this.quickAccess.deleteFromQuickAccessAndFromHand(greyWire.id);
      this.quickAccess.deleteFromQuickAccessAndFromHand(secondGreyWire.id);
      this.quickAccess.deleteFromQuickAccessAndFromHand(freonEvacuator.id);

      this.pickedItem = null;
      this.scenariosStep++;
    }
  }

  private rotateInstrumentPart(hit: PickingInfo, rotationK: number) {
    hit.pickedMesh.rotationQuaternion = null;
    const rotation =
      hit.pickedMesh.rotation[hit.pickedMesh.metadata.axis] - rotationK / 1000;
    if (
      rotation < hit.pickedMesh.metadata.min &&
      rotation > hit.pickedMesh.metadata.max
    ) {
      hit.pickedMesh.rotation[hit.pickedMesh.metadata.axis] -= rotationK / 1000;
      console.log(hit.pickedMesh.rotation);
    }
    // const axis = hit.pickedMesh.metadata.axis;
    // hit.pickedMesh.addRotation(rotationK / 1000, 0, 0);
  }

  private gaugeManifordManipulations() {
    const gaugeManifordId = 75;
    const greyWireId = 73;
    const gaugeManiford = this.bigInstruments.getByID(gaugeManifordId);
    const greyWire = this.bigInstruments.getByID(greyWireId);
    const redRotation = gaugeManiford.meshes[1].rotation.x;
    const blueRotation = gaugeManiford.meshes[2].rotation.x;
    const greyWireRotation = greyWire.meshes.at(-1).rotation.y;
    if (redRotation >= 1.4 && blueRotation >= 1.4 && greyWireRotation >= 1.4)
      this.scenariosStep++;
  }

  private letOffTheGas() {
    const secondGreyWireId = 77;
    const isInHand =
      this.quickAccess.isInQuickAccess(secondGreyWireId)?.isEnabled;
    if (this.constrols.useItem && isInHand) {
      const secondGreyWire = this.bigInstruments.getByID(secondGreyWireId);
      secondGreyWire.meshes.at(-1).rotationQuaternion = null;
      secondGreyWire.meshes.at(-1).rotation.y = 1.4;
      this.gasSound.play();
      this.scenariosStep++;
    }
  }

  private placementBallon() {
    const ballonId = 76;
    const secondGreyWireId = 77;

    const isInHand = this.quickAccess.isInQuickAccess(ballonId)?.isEnabled;
    if (isInHand) {
      const ballon = this.bigInstruments.getByID(ballonId);
      const secondGreyWire = this.bigInstruments.getByID(secondGreyWireId);
      this.hands.dropBigItem(ballon.picableMeshes[0]);
      if (this.quickAccess.isInQuickAccess(secondGreyWireId))
        this.hands.dropBigItem(secondGreyWire.picableMeshes[0]);
      ballon.picableMeshes[0].physicsBody.dispose();
      ballon.picableMeshes[0].position.set(-2.995, 4.828, -5.257);
      ballon.picableMeshes[0].rotationQuaternion = null;
      ballon.picableMeshes[0].rotation.set(0, Math.PI, Math.PI);
      secondGreyWire.meshes
        .at(-2)
        .physicsBody.setMotionType(PhysicsMotionType.STATIC);
      secondGreyWire.meshes.at(-2).position =
        ballon.meshes[3].getAbsolutePosition();
      this.quickAccess.deleteFromQuickAccessAndFromHand(ballon.id);
      this.quickAccess.deleteFromQuickAccessAndFromHand(secondGreyWire.id);
      this.scenariosStep++;
    }
  }

  private pullButton(hit: PickingInfo) {
    if (hit.pickedMesh.metadata?.axis && hit.pickedMesh.metadata?.angle) {
      hit.pickedMesh.rotation[hit.pickedMesh.metadata.axis] =
        hit.pickedMesh.metadata.angle;
      hit.pickedMesh.metadata.angle = -hit.pickedMesh.metadata.angle;
      hit.pickedMesh.metadata.isActive = !hit.pickedMesh.metadata.isActive;
      if (scenarios.prepareFreonEvacuatorWork === this.scenariosStep)
        this.prepareFreonEvacuatorWork();
    }
  }

  private prepareFreonEvacuatorWork() {
    const freonEvacuatorId = 74;
    const ballonId = 76;
    const freonEvacuator = this.bigInstruments.getByID(freonEvacuatorId);
    const ballon = this.bigInstruments.getByID(ballonId);
    const freonEvacuatorRotate = freonEvacuator.meshes[1];
    const freonEvacuatorRotation = freonEvacuatorRotate.rotation.x;
    const ballonValve = ballon.meshes[1];
    const ballonValveRotation = ballonValve.rotation.y;
    const auto = freonEvacuator.meshes[3].metadata.isActive;
    const power = freonEvacuator.meshes[2].metadata.isActive;
    console.log(
      freonEvacuatorRotation,
      freonEvacuatorRotation,
      ballonValveRotation,
      auto,
      power
    );
    if (
      freonEvacuatorRotation < -0.8 &&
      freonEvacuatorRotation > -1.3 &&
      ballonValveRotation <= 0.3 &&
      auto &&
      power
    ) {
      this.scenariosStep++;
    }
  }

  private freonEvacuatorToRecoverFast() {
    const freonEvacuatorId = 74;
    const freonEvacuator = this.bigInstruments.getByID(freonEvacuatorId);
    const freonEvacuatorRotate = freonEvacuator.meshes[1];
    const freonEvacuatorRotation = freonEvacuatorRotate.rotation.x;
    if (freonEvacuatorRotation > -0.4 && freonEvacuatorRotation < 0.4) {
      this.scenariosStep++;
    }
  }

  private freonEvacuatorToPurge() {
    const freonEvacuatorId = 74;
    const freonEvacuator = this.bigInstruments.getByID(freonEvacuatorId);
    const freonEvacuatorRotate = freonEvacuator.meshes[1];
    const freonEvacuatorRotation = freonEvacuatorRotate.rotation.x;
    if (freonEvacuatorRotation > 1.3 && freonEvacuatorRotation < 1.9) {
      this.scenariosStep++;
    }
  }

  private freonEvacuatorToDown() {
    const freonEvacuatorId = 74;
    const freonEvacuator = this.bigInstruments.getByID(freonEvacuatorId);
    const freonEvacuatorRotate = freonEvacuator.meshes[1];
    const freonEvacuatorRotation = freonEvacuatorRotate.rotation.x;
    if (freonEvacuatorRotation > 2.9 && freonEvacuatorRotation < 3.3) {
      this.scenariosStep++;
    }
  }

  private StartFreonEvacuator(hit: PickingInfo) {
    if (hit.pickedMesh.metadata.startButton) {
      this.freonEvacuatorSound.play();
      this.scenariosStep++;
    }
  }
}
