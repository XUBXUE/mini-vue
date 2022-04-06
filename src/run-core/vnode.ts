export function createVNode(type, props?, children?) {
  const vnode = {
    type, //组件
    props, //props
    children, //children
  };

  return vnode;
}
