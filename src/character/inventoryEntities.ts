import * as GUI from "@babylonjs/gui";

export class inventoryEntities {
  public static rightSliderButton: GUI.Button;
  public static leftSliderButton: GUI.Button;
  public static inventoryWrapper: GUI.Rectangle;
  public static textBlock: GUI.Rectangle;
  public static title: GUI.TextBlock;
  public static description: GUI.TextBlock;
  public static dropButton: GUI.Button;
  public static inventoryGrid: GUI.Grid;
  public static quickAccessGrid: GUI.Grid;
  public static advancedTexture: GUI.AdvancedDynamicTexture;
  public static draggingItem: GUI.Button;
  public static inventoryCells: Array<GUI.Button>;
  public static quickAccessCells: Array<GUI.Button>;
  constructor() {
    inventoryEntities.inventoryCells = [];
    inventoryEntities.quickAccessCells = [];
    this.createInventoryElements();
  }
  //функция создания GUI сетки инвентаря
  private createInventoryGrid(): GUI.Grid {
    const rows = 6;
    const columns = 16;
    const inventoryGrid = new GUI.Grid();

    inventoryGrid.width = "200%";
    inventoryGrid.left = "50%";
    for (let i = 0; i < rows; i++) {
      inventoryGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      inventoryGrid.addColumnDefinition(1 / columns);
    }
    inventoryGrid.clipChildren = false;
    inventoryGrid.clipContent = false;
    this.createInventoryCells(inventoryGrid);
    return inventoryGrid;
  }

  private createInventoryWrapper(): GUI.Rectangle {
    const inventoryWrapper = new GUI.Rectangle("inventoryWrapper");
    inventoryEntities.advancedTexture.addControl(inventoryWrapper);
    inventoryWrapper.addControl(inventoryEntities.inventoryGrid);
    inventoryWrapper.thickness = 0;
    inventoryWrapper.width = "90%";
    inventoryWrapper.height = "60%";
    inventoryWrapper.top = "-10%";
    inventoryWrapper.isVisible = false;
    return inventoryWrapper;
  }
  //создание ячеек инвентаря
  private createInventoryCells(grid: GUI.Grid): void {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 16; col++) {
        const cell = GUI.Button.CreateImageWithCenterTextButton(
          `but${row},${col}`,
          undefined,
          undefined
        );
        cell.color = "white";
        cell.background = "green";
        grid.addControl(cell, row, col);
        inventoryEntities.inventoryCells.push(cell);
      }
    }
  }

  //создание сетки панели быстрого доступа
  private createQuickAccessGrid() {
    const rows = 1;
    const columns = 8;
    const quickAccessGrid = new GUI.Grid();
    inventoryEntities.advancedTexture.addControl(quickAccessGrid);
    quickAccessGrid.width = "90%";
    quickAccessGrid.height = "10%";
    quickAccessGrid.top = "35%";
    for (let i = 0; i < rows; i++) {
      quickAccessGrid.addRowDefinition(1 / rows);
    }
    for (let i = 0; i < columns; i++) {
      quickAccessGrid.addColumnDefinition(1 / columns);
    }

    this.createQuickAccessCells(quickAccessGrid);

    return quickAccessGrid;
  }
  //создание ячеек панели быстрого доступа
  private createQuickAccessCells(grid: GUI.Grid) {
    for (let row = 0; row < 1; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = GUI.Button.CreateImageWithCenterTextButton(
          `but${row},${col}`,
          undefined,
          undefined
        );
        cell.color = "white";
        cell.background = "gray";
        cell.isPointerBlocker = true;
        grid.addControl(cell, row, col);
        inventoryEntities.quickAccessCells.push(cell);
      }
    }
  }
  private createTextBlock(): GUI.Rectangle {
    const textBlock = new GUI.Rectangle("textBlock");

    textBlock.addControl(inventoryEntities.title);
    textBlock.addControl(inventoryEntities.description);
    textBlock.isVisible = false;
    textBlock.zIndex = 2;
    textBlock.background = "white";
    textBlock.clipChildren = false;
    textBlock.clipContent = false;
    textBlock.adaptHeightToChildren = true;
    textBlock.adaptWidthToChildren = true;
    inventoryEntities.advancedTexture.addControl(textBlock);
    return textBlock;
  }

  private createTextBlockParts(): void {
    const title = new GUI.TextBlock("title", undefined);
    title.resizeToFit = true;
    const description = new GUI.TextBlock("description", undefined);
    description.resizeToFit = true;
    description.paddingTopInPixels = title.heightInPixels;
    inventoryEntities.title = title;
    inventoryEntities.description = description;
  }
  private createSliderButtons(): void {
    const leftSliderButton = new GUI.Button("leftSliderButton");
    const rightSliderButton = new GUI.Button("rightSliderButton");
    inventoryEntities.advancedTexture.addControl(leftSliderButton);
    inventoryEntities.advancedTexture.addControl(rightSliderButton);
    leftSliderButton.width = "5%";
    leftSliderButton.height = "5%";
    rightSliderButton.width = "5%";
    rightSliderButton.height = "5%";
    leftSliderButton.background = "black";
    rightSliderButton.background = "black";
    leftSliderButton.left = "-50%";
    rightSliderButton.left = "50%";
    leftSliderButton.isVisible = false;
    rightSliderButton.isVisible = false;
    inventoryEntities.leftSliderButton = leftSliderButton;
    inventoryEntities.rightSliderButton = rightSliderButton;
  }

  private createDropButton(): GUI.Button {
    const dropButton = GUI.Button.CreateSimpleButton("drop", "выбросить");
    dropButton.color = "white";
    dropButton.background = "black";
    dropButton.height = "40%";
    return dropButton;
  }

  //метод оболочка для метов создания элементов инвентаря
  private createInventoryElements() {
    inventoryEntities.advancedTexture =
      GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    inventoryEntities.inventoryGrid = this.createInventoryGrid();
    inventoryEntities.inventoryWrapper = this.createInventoryWrapper();
    inventoryEntities.quickAccessGrid = this.createQuickAccessGrid();
    inventoryEntities.dropButton = this.createDropButton();
    this.createTextBlockParts();
    inventoryEntities.textBlock = this.createTextBlock();
    this.createSliderButtons();
  }
}
