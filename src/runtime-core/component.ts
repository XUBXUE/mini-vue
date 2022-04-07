export function createComponentInstance(vnode) {
  const instance = {
    vnode, // 组件vnode
    type: vnode.type, // 组件对象
  };

  return instance;
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()
  // 处理组件的数据状态
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  // 获取setup返回的结果挂载到组件实例上
  const component = instance.type;
  const { setup } = component;
  // 如果组件存在setup函数则对其返回结果进行处理
  if (setup) {
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  // setup返回的可能是数据对象也可能是函数（视为render函数）
  // TODO 处理function情况
  // if (typeof setupResult === "function") {
  //   const component = instance.type;
  //   component.render = setupResult;
  // }
  // 如果setup返回的结果是对象类型 则表明返回的是一些数据状态，则将这些状态挂载到组件实例的setupState属性上
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  // 获取组件对象
  const component = instance.type;
  // 如果组件实例上没有render函数，则将组件对象上的render函数赋值给组件实例
  if (!instance.render) {
    instance.render = component.render;
  }
}