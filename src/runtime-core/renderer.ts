import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { Fragment, Text } from "./vnode";

export function render(vnode: any, container: any) {
  // render函数里做patch打补丁操作来生成/更新/删除真实DOM
  patch(vnode, container);
}

function patch(vnode: any, container: any) {
  // vnode的type为字符串类型时，表示为一个元素标签，否则表示为一个组件
  const { type, shapeFlag } = vnode;
  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
      break;
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

// fragment节点直接处理children内容
function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
}

// text文本节点直接生成一个text节点的dom添加到容器里
function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.appendChild(textNode);
}

function mountElement(vnode: any, container: any) {
  const { type, props, children } = vnode;
  // 根据type生成指定的标签元素
  const el = (vnode.el = document.createElement(type));
  if (props && isObject(props)) {
    for (const key in props) {
      // 如果key为on开头则表示是注册一个事件
      const isOn = (key: string) => /^on[A-Z]/.test(key);
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, props[key]);
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el);
  }
  container.appendChild(el);
}

function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
}

function mountComponent(initialVNode: any, container: any) {
  // 生成组件实例
  const instance = createComponentInstance(initialVNode);
  // 处理组件的数据状态（reactive/ref/props/slots等）处理渲染函数等
  setupComponent(instance);
  // 处理完组件的相应书数据和渲染函数后就可以开始执行render函数进行递归patch了
  setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
  const { proxy } = instance;
  const subtree = instance.render.call(proxy);

  //会的虚拟节点树后，循环调用去生成真实dom
  patch(subtree, container);

  // 将组件的根节点赋值给vnode.el以便$el来获取
  initialVNode.el = subtree.el;
}
