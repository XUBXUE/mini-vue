import { h } from "../h";
import { Fragment } from "../vnode";

export function renderSlots(slots, name: string = "default", props: any) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot == "function") {
      return h(Fragment, {}, slot(props));
    }
  }
}
