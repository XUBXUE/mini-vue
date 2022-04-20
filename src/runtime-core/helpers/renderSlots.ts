import { h } from "../h";
import { Fragment } from "../vnode";

/**
 * 
 * @param slots 组件的所有插槽
 * @param name 具名插槽的name
 * @param props 作用域插槽的值
 * @param slotContent 插槽的默认内容
 * @returns 返回插槽的内容
 */
export function renderSlots(
  slots,
  name: string = "default",
  props: any,
  slotContent: Function
) {
  const slot = slots[name];
  // 插槽内容用fragment节点渲染，这样不会给插槽生成额外的父级包裹节点
  if (slot && typeof slot == "function") {
    return h(Fragment, {}, slot(props));
  } else if (slotContent && typeof slotContent == "function") {
    return h(Fragment, {}, slotContent());
  }
}
