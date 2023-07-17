import { Inventory } from "../character/inventory/inventory";
import { QuickAccess } from "../character/inventory/quickAccess";

const checkInstruments = (
  inventory: Inventory,
  quickAccess: QuickAccess,
  instruments: number[]
) => {
  const needfulInstruments = instruments.reduce(function (acc, id) {
    const haveInInventory = inventory.inventory.find((item) => item.id === id);
    const haveInQuickAccess = quickAccess.quickAccess.find(
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
};

const pumpingOutFreonCheckInstruments = (
  inventory: Inventory,
  quickAccess: QuickAccess
) => {
  const instruments = [1, 32];
  return checkInstruments(inventory, quickAccess, instruments);
};

export const pumpingOutFreon = {
  pumpingOutFreonCheckInstruments,
};
