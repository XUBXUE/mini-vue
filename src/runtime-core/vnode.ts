import { isArray } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol('Fragment');

export function createVNode(type, props?, children?) {
  const vnode = {
    type, //组件
    props, //props
    children, //children
    shapeFlag: getShapeFlag(type),
    el: null,
  };

  if (typeof children == "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag && ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children == "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type == "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
