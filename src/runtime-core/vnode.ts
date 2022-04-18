import { isArray } from "../shared";
import { ShapFlags } from "../shared/shapeFlags";

export function createVNode(type, props?, children?) {
  const vnode = {
    type, //组件
    props, //props
    children, //children
    shapeFlag: getShapeFlag(type),
    el: null,
  };

  if (typeof children == "string") {
    vnode.shapeFlag |= ShapFlags.TEXT_CHILDREN;
  } else if (isArray(children)) {
    vnode.shapeFlag |= ShapFlags.ARRAY_CHILDREN;
  }

  return vnode;
}

function getShapeFlag(type) {
  return typeof type == "string"
    ? ShapFlags.ELEMENT
    : ShapFlags.STATEFUL_COMPONENT;
}
