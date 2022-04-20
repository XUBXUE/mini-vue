import { isArray } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  // 组件内容是slot
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

// 将slots格式化
function normalizeObjectSlots(children: any, slots: any) {
  if (children && typeof children == "object") {
    for (const key in children) {
      const value = children[key];
      if (value) {
        slots[key] = (props: any) => normalizeSlotValue(value(props));
      }
    }
  }
}

function normalizeSlotValue(value) {
  return isArray(value) ? value : [value];
}
