import { isArray } from "../shared";

export function initSlots(instance, children) {
  normalizeObjectSlots(children, instance.slots);
}

function normalizeObjectSlots(children: any, slots: any) {
  if (children && typeof children == "object") {
    for (const key in children) {
      const value = children[key];
      if (value) {
        slots[key] = normalizeSlotValue(value);
      }
    }
  }
}

function normalizeSlotValue(value) {
  return isArray(value) ? value : [value];
}
