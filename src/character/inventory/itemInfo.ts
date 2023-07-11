import * as GUI from "@babylonjs/gui";
import { Instruments, instrument } from "../instruments.ts/instruments";

export default class ItemInfo {
  public textBlock: GUI.Rectangle;
  public title: GUI.TextBlock;
  public description: GUI.TextBlock;
  public draggingItem: GUI.Button;

  constructor(private advancedTexture: GUI.AdvancedDynamicTexture) {
    this.title = this.createTextBlockTitle();
    this.description = this.createTextBlockDescription();
    this.textBlock = this.createTextBlock();
  }
  private createTextBlock(): GUI.Rectangle {
    const textBlock = new GUI.Rectangle("textBlock");

    textBlock.addControl(this.title);
    textBlock.addControl(this.description);
    textBlock.isVisible = false;
    textBlock.zIndex = 2;
    textBlock.background = "white";
    textBlock.clipChildren = false;
    textBlock.clipContent = false;
    textBlock.adaptHeightToChildren = true;
    textBlock.adaptWidthToChildren = true;
    this.advancedTexture.addControl(textBlock);
    return textBlock;
  }

  private createTextBlockTitle(): GUI.TextBlock {
    const title = new GUI.TextBlock("title", undefined);
    title.resizeToFit = true;
    return title;
  }
  private createTextBlockDescription(): GUI.TextBlock {
    const description = new GUI.TextBlock("description", undefined);
    description.resizeToFit = true;
    description.paddingTopInPixels = this.title.heightInPixels;
    return description;
  }

  public showItemInfo(
    cell: GUI.Button,
    isDragItem: boolean,
    items: Instruments
  ) {
    if (cell.textBlock.text != "" && !isDragItem) {
      const item = items.getByID(cell.metadata.id);
      this.title.text = item.name;
      this.description.text = item.description;
      this.itemInfoPosition(cell);
      this.textBlock.isVisible = true;
    } else return;
  }

  private itemInfoPosition(cell: GUI.Button) {
    this.textBlock.leftInPixels =
      cell.transformedMeasure.left +
      this.textBlock.widthInPixels / 2 +
      cell.widthInPixels -
      document.body.clientWidth / 2;
    this.textBlock.topInPixels =
      cell.transformedMeasure.top -
      document.body.clientHeight / 2 +
      this.textBlock.heightInPixels / 2;

    this.title.paddingBottomInPixels = 10;
    this.description.paddingTopInPixels = this.title.heightInPixels;
  }

  public disableTextBlock() {
    this.textBlock.isVisible = false;
  }
}
