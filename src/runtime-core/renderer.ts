import { createComponentInstance, setupComponent } from "./component";

export function render(vnode, container) {
  // render函数里做patch打补丁操作来生成/更新/删除真实DOM
  patch(vnode, container);
}

function patch(vnode, container) {
  if (typeof vnode == 'string') {
    processElement(vnode, container);
  } else {
    processComponent(vnode, container);
  }
}

function processElement() {
  mountElement()
}

function processComponent(vnode: any, container) {
  mountComponent(vnode, container);
}

function mountComponent(vnode, container) {
  // 生成组件实例
  const instance = createComponentInstance(vnode);
  // 处理组件的数据（reactive/ref/props/slots等）处理渲染函数等
  setupComponent(instance);
  // 处理完组件的数据和渲染函数后就可以开始执行render函数进行递归patch了
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subtree = instance.render();

  //会的虚拟节点树后，循环调用去生成真实dom
  patch(subtree, container)
}
