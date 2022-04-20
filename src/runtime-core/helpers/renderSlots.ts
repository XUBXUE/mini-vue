import { h } from "../h";

export function renderSlots(slots, name: string = "default", props: any) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot == "function") {
      return h("div", {}, slot(props));
    }
  }
}
