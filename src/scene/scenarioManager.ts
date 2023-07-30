import * as GUI from "@babylonjs/gui";
import WorkScenarios from "./workScenarios";
import { Inventory } from "../character/inventory/inventory";
import { QuickAccess } from "../character/inventory/quickAccess";
import rayCast from "../character/rayCast";
import {
  AbstractMesh,
  Engine,
  KeyboardInfo,
  PointerInfo,
  Scene,
} from "@babylonjs/core";
import ControllEvents from "../character/characterControls";
import { BigInstruments } from "../character/instruments.ts/bigInstruments";
import Hands from "../character/hands";
import { scenarios as freonRemovalScenarios } from "./workScenarios";

enum tasks {
  freonRemoval,
  something,
}

export default class ScenarioManager {
  private cells: GUI.Rectangle[];
  constructor(
    private advancedTexture: GUI.AdvancedDynamicTexture,
    private inventory: Inventory,
    private quickAccess: QuickAccess,
    private raycast: rayCast,
    private scene: Scene,
    private engine: Engine,
    private body: AbstractMesh,
    private controls: ControllEvents,
    private bigInstruments: BigInstruments,
    private hands: Hands,
    private pickedItem: AbstractMesh
  ) {
    this.createScenarioSelector();
  }

  private createScenarioSelector() {
    const grid = new GUI.Grid();
    let index = 0;
    Object.keys(tasks).forEach((elem) => {
      if (isNaN(+elem)) {
        grid.addRowDefinition(30, false);
        const scenarioButton = GUI.Button.CreateSimpleButton(`${index}`, elem);
        scenarioButton.onPointerClickObservable.add(() => {
          this.selectScenario(scenarioButton.name, grid);
        });
        grid.addControl(scenarioButton, index, 0);
        index++;
      }
    });
    grid.height = 5 * (index + 1) + "%";
    grid.width = "30%";
    grid.top = "-40%";
    grid.left = "35%";
    grid.background = "white";
    grid.isVisible = false;
    this.scene.onKeyboardObservable.add((event) => {
      this.controls.handleTasksMenuEvents(event);
      this.showTaskMenu(grid, event);
    });
    this.advancedTexture.addControl(grid);
  }

  private createTaskTracker(scenarios) {
    const grid = new GUI.Grid();
    let index = 0;
    this.cells = [];
    Object.keys(scenarios).forEach((elem) => {
      if (isNaN(+elem)) {
        grid.addRowDefinition(30, false);
        const scenarioBlock = new GUI.Rectangle(`${index}`);
        const textBlock = new GUI.TextBlock(`${index}`, elem);
        scenarioBlock.background = "white";
        scenarioBlock.alpha = 0.6;
        scenarioBlock.addControl(textBlock);
        grid.addControl(scenarioBlock, index, 0);
        this.cells.push(scenarioBlock);
        index++;
      }
    });

    grid.height = 5 * (index + 1) + "%";
    grid.width = "30%";
    grid.top = "0%";
    grid.left = "35%";

    this.advancedTexture.addControl(grid);
  }

  private markFinishedStep(index: number) {
    this.cells[index].background = "green";
  }

  private showTaskMenu(grid: GUI.Grid, event: KeyboardInfo) {
    if (this.controls.tasks) {
      this.engine.exitPointerlock();
      grid.isVisible = true;
    } else if (event.event.code === "Tab") {
      this.engine.enterPointerlock();
      grid.isVisible = false;
    }
  }

  private selectScenario(name: string, grid: GUI.Grid) {
    if (tasks.freonRemoval === +name) {
      const num = new WorkScenarios(
        this.inventory,
        this.quickAccess,
        this.raycast,
        this.scene,
        this.body,
        this.controls,
        this.bigInstruments,
        this.hands,
        this.pickedItem,
        this.markFinishedStep.bind(this)
      );
      this.createTaskTracker(freonRemovalScenarios);
    }
    grid.dispose();
    this.engine.enterPointerlock();
    this.controls.tasks = false;
  }
}
