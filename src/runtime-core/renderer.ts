import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: any) {
  // render函数里做patch打补丁操作来生成/更新/删除真实DOM
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // vnode的type为字符串类型时，表示为一个元素标签，否则表示为一个组件
  if (typeof vnode.type == "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  // 初始化element
  mountElement(vnode, container);
  // TODO: 更新element
}

function processComponent(vnode: any, container: any) {
  // 初始化组件
  mountComponent(vnode, container);
  // TODO: 更新组件
}

function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  // 根据type生成指定的标签元素
  const el = document.createElement(type);
  if (props && isObject(props)) {
    for (const key in props) {
      el.setAttribute(key, props[key]);
    }
  }
  if (typeof children == "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }
  container.appendChild(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

function mountComponent(vnode: any, container: any) {
  // 生成组件实例
  const instance = createComponentInstance(vnode);
  // 处理组件的数据（reactive/ref/props/slots等）处理渲染函数等
  setupComponent(instance);
  // 处理完组件的数据和渲染函数后就可以开始执行render函数进行递归patch了
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  const { proxy } = instance;
  const subtree = instance.render.call(proxy);

  //会的虚拟节点树后，循环调用去生成真实dom
  patch(subtree, container);
}
