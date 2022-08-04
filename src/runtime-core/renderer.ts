import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { shouldUpdateComponent } from "./componentUpdateUtils";
import { createAppApi } from "./createApp";
import { queueJobs } from "./scheduler";
import { Fragment, Text } from "./vnode";

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;
  function render(vnode: any, container: any) {
    // render函数里做patch打补丁操作来生成/更新/删除真实DOM
    patch(null, vnode, container, null, null);
  }

  function patch(
    n1: any,
    n2: any,
    container: any = null,
    parentComponent: any = null,
    anchor: any = null
  ) {
    // vnode的type为字符串类型时，表示为一个元素标签，否则表示为一个组件
    const { type, shapeFlag } = n2;
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor);
        break;
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent);
        }
        break;
    }
  }

  function processElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    if (!n1) {
      // 初始化element
      mountElement(n2, container, parentComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentComponent, anchor);
    }
  }

  function patchElement(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    console.log("n1", n1);
    console.log("n2", n2);

    const prevProps = n1.props || EMPTY_OBJ;
    const nextProps = n2.props || EMPTY_OBJ;

    const el = (n2.el = n1.el);

    patchChildren(n1, n2, el, parentComponent, anchor);
    patchProps(el, prevProps, nextProps);

    // TODO: 更新children
  }

  function patchChildren(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    // patch子级元素有四种情况
    // 1. array -> text
    // 2. text -> text
    // 3. text -> array
    // 4. array -> array
    const prevShapeFlag = n1.shapeFlag;
    const nextShapeFlag = n2.shapeFlag;
    const c1 = n1.children;
    const c2 = n2.children;

    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新的是text
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的是text 老的是array 会先把所有array中的元素移除
        unmountChildren(c1);
      }
      // 不管旧的是array还是text  只要与新的不相同就会重新填写文本内容，因为这里的条件是 新的是textc
      if (c1 != c2) {
        hostSetElementText(container, c2);
      }
    } else {
      // 新的是array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 新的是array 旧的是text
        hostSetElementText(container, "");
        mountChildren(c2, container, parentComponent, anchor);
      } else {
        // 新的是array 旧的也是array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // diff算法
  function patchKeyedChildren(
    c1: any,
    c2: any,
    container: any,
    parentComponent: any,
    parentAnchor: any
  ) {
    // 该patch算法用到的是双端算法
    // 定义指针变量i, c1的最后一个元素的索引e1, c2的最后一个元素的索引e2
    // 通过对比来获取不相同的子级范围
    // 逻辑大概如下：
    // 1. 先从左侧开始对比，相同就指针变量+1，不同就跳出循环
    // 2. 从右侧开始对比，相同就对e1和e2 -1，不同就跳出循环
    // 3. 比较新的比旧的多
    // 4. 比较旧的比新的多
    // 5. 对比中间内容，有三种情况：
    //  1) 创建新增的元素
    //  2) 删除旧的元素
    //  3) 移动老的元素（位置变化）

    const l2 = c2.length;
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;

    function isSameVNodeType(n1: any, n2: any) {
      return n1.type == n2.type && n1.key == n2.key;
    }

    // 1.左侧对比 这里取到了从左侧开始节点不同的位置索引 i
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
    }

    // 2.右侧对比 这里
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      e1--;
      e2--;
    }

    // 3. 新的比旧的多
    // 这时i的值应比e1要大,比e2要小 因为已经遍历完了c1，还剩下多余的c2的内容
    // 左边多时 e1为-1 e2大于等于0 i为0 所以i>e1,i<=e2
    // 右边多时 e1为旧的长度 e2为新的长度且大于e1 i为旧的长度+1 所以i>e1,i<=e2
    if (i > e1) {
      if (i <= e2) {
        const anthorIndex = e2 + 1;
        const anchor = anthorIndex < l2 ? c2[anthorIndex].el : null;
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      // 4. 旧的比新的多
      // 这时i的值应比e2要大,比e1要小 因为已经遍历完了c2，还剩下多余的c1的内容
      // 左边多时 e1大于等于0 e2为-1 i为0  所以i>e2,i<=e1
      // 右边多时 e1为旧的长度 e2为新的长度且小于e1 i为新的长度+1 所以i<=e1,i>e2
      if (i <= e1) {
        while (i <= e1) {
          // 将多余的旧节点直接删除
          hostRemove(c1[i].el);
          i++;
        }
      }
    } else {
      // 5. 对比中间内容
      // i为获取到子级节点中间部分的数组的开始索引
      let s1 = i; //旧children的中间部分的开始索引
      let s2 = i; //新children的中间部分的开始索引
      const toBePatched = e2 - s2 + 1; //新的chilren里所需要对比的元素个数
      let patched = 0; // 当前patch了几个新的children里的元素
      const keyToNewIndexMap = new Map(); // 保存根据新children中间部分每个元素的key和索引位置的映射关系
      const newKeyToOldKeyMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) newKeyToOldKeyMap[i] = 0;
      let move = false;
      let maxNewIndexSoFar = 0;

      // 用新的children的中间部分元素内容给映射map添加映射关系
      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          // 当前patch的数量大于了需要对比的数量，则表示都是多余的旧元素 需要删除
          hostRemove(prevChild.el);
          continue;
        }

        // 通过旧列表中元素的key来找到对应新列表中的元素并获取在新列表中的索引
        let nextIndex;
        if (prevChild.key != null) {
          nextIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              nextIndex = j;
              break;
            }
          }
        }

        if (!nextIndex) {
          // 如果没有找到该索引，表示新列表中没有存在该元素 则删除
          hostRemove(prevChild.el);
        } else {
          if (nextIndex > maxNewIndexSoFar) {
            maxNewIndexSoFar = nextIndex;
          } else {
            move = true;
          }

          newKeyToOldKeyMap[nextIndex - s2] = i + 1;
          // 如果找到了则patch这个旧元素和根据index获取到的新元素
          patch(prevChild, c2[nextIndex], container, parentComponent, null);
          // patch的数量加一
          patched++;
        }
      }

      const increasingNewIndexSequence = move
        ? getSequence(newKeyToOldKeyMap)
        : [];

      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
        if (newKeyToOldKeyMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor);
        } else if (move) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (const child of children) {
      hostRemove(child.el);
    }
  }

  function patchProps(el, prevProps, nextProps) {
    // prop更新的几种情况
    // 1.有新的prop添加
    // 2.prop的值更改
    // 3.pprop的值改为undefined或null
    // 4.prop被删除了
    if (prevProps !== nextProps) {
      // 判断新属性与就属性是否相同，不同就修改属性值
      for (const key in nextProps) {
        const newProp = nextProps[key];
        const oldProp = prevProps[key];
        if (newProp !== oldProp) {
          hostPatchProp(el, key, oldProp, newProp);
        }
      }
      if (prevProps != EMPTY_OBJ) {
        // 判断旧vnode中属性是否存在于新vnode属性中，不存在就赋值null 删除掉
        for (const key in prevProps) {
          if (!(key in nextProps)) {
            hostPatchProp(el, key, prevProps[key], null);
          }
        }
      }
    }
  }

  function processComponent(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any
  ) {
    if (!n1) {
      // 初始化组件
      mountComponent(n2, container, parentComponent);
    } else {
      updateComponent(n1, n2);
    }
    // TODO: 更新组件
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update();
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  // fragment节点直接处理children内容
  function processFragment(
    n1: any,
    n2: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    mountChildren(n2.children, container, parentComponent, anchor);
  }

  // text文本节点直接生成一个text节点的dom添加到容器里
  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.appendChild(textNode);
  }

  function mountElement(
    vnode: any,
    container: any,
    parentComponent: any,
    anchor: any
  ) {
    const { type, props, children, shapeFlag } = vnode;
    // 根据type生成指定的标签元素
    const el = (vnode.el = hostCreateElement(type));

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor);
    }

    if (props && isObject(props)) {
      for (const key in props) {
        const value = props[key];
        hostPatchProp(el, key, null, value);
      }
    }

    hostInsert(el, container, anchor);
  }

  function mountChildren(children, container, parentComponent, anchor: any) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor);
    });
  }

  function mountComponent(initialVNode: any, container: any, parentComponent) {
    // 生成组件实例
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ));
    // 处理组件的数据状态（reactive/ref/props/slots等）处理渲染函数等
    setupComponent(instance);
    // 处理完组件的相应书数据和渲染函数后就可以开始执行render函数进行递归patch了
    setupRenderEffect(instance, initialVNode, container);
  }

  function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          console.log("初始化阶段，生成subtree并patch生成真实DOM");
          const { proxy } = instance;
          // 第一个proxy为绑定this上下文 第二个为编译后的渲染函数提供的第一个参数（_ctx）
          const subtree = (instance.subtree = instance.render.call(
            proxy,
            proxy
          ));
          //生成虚拟节点树后，对节点树进行patch生成真实dom
          patch(null, subtree, container, instance, null);

          // 将组件的根节点赋值给vnode.el以便$el来获取
          initialVNode.el = subtree.el;
          instance.isMounted = true;
        } else {
          console.log("更新阶段，生成新的subtree用来和旧的subtree进行比较");
          const { next, vnode } = instance;
          if (next) {
            next.el = vnode.el;
            updateComponentPreRender(instance, next);
          }
          const { proxy } = instance;
          // 第一个proxy为绑定this上下文 第二个为编译后的渲染函数提供的第一个参数（_ctx）
          const subtree = instance.render.call(proxy, proxy);
          const prevSubtree = instance.subtree;
          instance.subtree = subtree;
          patch(prevSubtree, subtree, container, instance, null);
        }
      },
      {
        scheduler() {
          queueJobs(instance.update);
        },
      }
    );
  }

  return {
    createApp: createAppApi(render),
  };
}

function updateComponentPreRender(instance: any, nextVNode: any) {
  instance.vnode = nextVNode;
  instance.next = null;
  instance.props = nextVNode.props;
}

function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
