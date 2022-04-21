import { effect } from "../reactivity/effect";
import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

const EMPTY_OBJ = {};

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options;
  function render(vnode: any, container: any) {
    // render函数里做patch打补丁操作来生成/更新/删除真实DOM
    patch(null, vnode, container, null);
  }

  function patch(n1: any, n2: any, container: any, parent) {
    // vnode的type为字符串类型时，表示为一个元素标签，否则表示为一个组件
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parent);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parent);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parent);
        }
        break;
    }
  }

  function processElement(n1: any, n2: any, container: any, parent: any) {
    console.log("n11", n1);
    if (!n1) {
      // 初始化element
      mountElement(n2, container, parent);
    } else {
      patchElement(n1, n2, container, parent);
    }
  }

  function patchElement(n1: any, n2: any, container: any, parent: any) {
    console.log("n1", n1);
    console.log("n2", n2);

    const prevProps = n1.props || EMPTY_OBJ;
    const nextProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);

    patchProps(el, prevProps, nextProps);

    // TODO: 更新children
  }

  function patchProps(el, prevProps, nextProps) {
    // prop更新的几种情况
    // 1.有新的prop添加
    // 2.prop的值更改
    // 3.pprop的值改为undefined或null
    // 4.prop被删除了
    console.log("patchProps", nextProps, prevProps);
    if (prevProps !== nextProps) {
      for (const key in nextProps) {
        const newProp = nextProps[key];
        const oldProp = prevProps[key];
        if (newProp !== oldProp) {
          hostPatchProp(el, key, oldProp, newProp);
        }
      }
      if (prevProps != EMPTY_OBJ) {
        for (const key in prevProps) {
          if (!(key in nextProps)) {
            hostPatchProp(el, key, prevProps[key], null);
          }
        }
      }
    }
  }

  function processComponent(n1: any, n2: any, container: any, parent: any) {
    // 初始化组件
    mountComponent(n2, container, parent);
    // TODO: 更新组件
  }

  // fragment节点直接处理children内容
  function processFragment(n1: any, n2: any, container: any, parent: any) {
    mountChildren(n2, container, parent);
  }

  // text文本节点直接生成一个text节点的dom添加到容器里
  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.appendChild(textNode);
  }

  function mountElement(vnode: any, container: any, parent: any) {
    const { type, props, children } = vnode;
    // 根据type生成指定的标签元素
    const el = (vnode.el = hostCreateElement(type));
    if (props && isObject(props)) {
      for (const key in props) {
        const value = props[key];
        hostPatchProp(el, key, null, value);
      }
    }
    if (vnode.shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (vnode.shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parent);
    }
    hostInsert(el, container);
  }

  function mountChildren(vnode, container, parent) {
    vnode.children.forEach((v) => {
      patch(null, v, container, parent);
    });
  }

  function mountComponent(initialVNode: any, container: any, parent) {
    // 生成组件实例
    const instance = createComponentInstance(initialVNode, parent);
    // 处理组件的数据状态（reactive/ref/props/slots等）处理渲染函数等
    setupComponent(instance);
    // 处理完组件的相应书数据和渲染函数后就可以开始执行render函数进行递归patch了
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    effect(() => {
      if (!instance.isMounted) {
        console.log("初始化阶段，生成subtree并patch生成真实DOM");
        const { proxy } = instance;
        const subtree = (instance.subtree = instance.render.call(proxy));
        //生成虚拟节点树后，对节点树进行patch生成真实dom
        patch(null, subtree, container, instance);

        // 将组件的根节点赋值给vnode.el以便$el来获取
        initialVNode.el = subtree.el;
        instance.isMounted = true;
      } else {
        console.log("更新阶段，生成新的subtree用来和旧的subtree进行比较");
        const { proxy } = instance;
        const subtree = instance.render.call(proxy);
        const prevSubtree = instance.subtree;
        instance.subtree = subtree;
        patch(prevSubtree, subtree, container, instance);
      }
    });
  }

  return {
    createApp: createAppApi(render),
  };
}
