import { h } from "../h";

export function renderSlots(slots, name: string = 'default') {
  const slot = slots[name];
  if (slot) {
    return h("div", {}, slot);
  }
}
