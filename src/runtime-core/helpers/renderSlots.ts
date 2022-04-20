import { h } from "../h";
import { Fragment } from "../vnode";

export function renderSlots(
  slots,
  name: string = "default",
  props: any,
  slotContent: Function
) {
  const slot = slots[name];
  if (slot && typeof slot == "function") {
    return h(Fragment, {}, slot(props));
  } else if (slotContent && typeof slotContent == "function") {
    return h(Fragment, {}, slotContent());
  }
}
