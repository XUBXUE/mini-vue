import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { emit } from "./componentEmit";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "../reactivity/ref";

export function createComponentInstance(vnode, parent) {
  const instance = {
    vnode, // 组件vnode
    next: null, // 更新后的vnode
    type: vnode.type, // 组件对象
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    subtree: {},
    isMounted: false,
    emit: () => {},
  };

  instance.emit = emit as any;

  return instance;
}

export function setupComponent(instance) {
  // 初始化props
  initProps(instance, instance.vnode.props);
  // 初始化slots
  initSlots(instance, instance.vnode.children);
  // 处理组件的数据状态
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  // 获取setup返回的结果挂载到组件实例上
  const component = instance.type;

  instance.proxy = new Proxy(
    // 传入一个属性为_值为instance的对象
    { _: instance },
    PublicInstanceProxyHandlers
  );

  const { setup } = component;
  // 如果组件存在setup函数则对其返回结果进行处理
  if (setup) {
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit.bind(null, instance),
    });
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // setup返回的可能是数据对象也可能是函数（视为render函数）
  // TODO: 处理function情况
  // if (typeof setupResult === "function") {
  //   const component = instance.type;
  //   component.render = setupResult;
  // }
  // 如果setup返回的结果是对象类型 则表明返回的是一些数据状态，则将这些状态挂载到组件实例的setupState属性上
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  // 获取组件对象
  const component = instance.type;
  // 如果组件实例上没有render函数，则将组件对象上的render函数赋值给组件实例
  if (component.render) {
    instance.render = component.render;
  }
}

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
