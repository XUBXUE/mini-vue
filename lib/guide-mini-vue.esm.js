function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type, // 组件对象
    };
    return instance;
}
function setupComponent(instance) {
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
function handleSetupResult(instance, setupResult) {
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
function finishComponentSetup(instance) {
    // 获取组件对象
    const component = instance.type;
    // 如果组件实例上没有render函数，则将组件对象上的render函数赋值给组件实例
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    // render函数里做patch打补丁操作来生成/更新/删除真实DOM
    patch(vnode);
}
function patch(vnode, container) {
    processComponent(vnode);
}
function processComponent(vnode, container) {
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 生成组件实例
    const instance = createComponentInstance(vnode);
    // 处理组件的数据（reactive/ref/props/slots等）处理渲染函数等
    setupComponent(instance);
    // 处理完组件的数据和渲染函数后就可以开始执行render函数进行递归patch了
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    const subtree = instance.render();
    //会的虚拟节点树后，循环调用去生成真实dom
    patch(subtree);
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children, //children
    };
    return vnode;
}

//将根组件传递给createApp函数
function createApp(rootComponent) {
    // 返回应用实例实例
    return {
        // 其中组件实例包含一个叫mount的方法来挂载组件，接受一个挂载容器参数
        mount(rootContainer) {
            if (typeof rootContainer == 'string') {
                rootContainer = document.querySelector(rootContainer);
            }
            // 先将根组件转换成VNode，再基于VNode做处理
            const vnode = createVNode(rootComponent);
            // 将vnode传递给渲染函数做组件的配置处理
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
