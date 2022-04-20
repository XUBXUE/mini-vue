const extend = Object.assign;
const isObject = (value) => {
    return typeof value === "object" && value !== null;
};
const isArray = Array.isArray;
const hasOwn = (value, key) => {
    return Object.prototype.hasOwnProperty.call(value, key);
};
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

//创建全局变量 响应式对象的依赖收集容器
const targetsMap = new Map();
/**
 * 依赖触发函数
 * @param target 响应式对象
 * @param key 对象属性名
 */
function trigger(target, key) {
    // 获取target、key对应的依赖集合
    let depsMap = targetsMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    // 遍历执行
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

// 因为所有proxy用到的get或set都是一样的，所以全局声明get和set使用，防止每创建一个响应式对象或只读对象所带来的创建get和set的内存消耗
// reactive响应式对象用到的get处理函数
const get = createGetter();
// reactive响应式对象用到的set处理函数
const set = createdSetter();
// reactive响应式对象用到的has处理函数
const has = createdHasFn();
// readonly只读对象用到的get处理函数
const readonlyGet = createGetter(true);
// shallowReadonly浅只读对象用到的get处理函数
const shallowReadonlyGet = createGetter(true, true);
// shallowReactive浅响应对象用到的get处理函数
const shallowReactiveGet = createGetter(false, true);
/**
 * get处理函数
 * @param isReadonly 是否设置为只读
 * @param isShallow 是否只代理对象最外层
 */
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key, receiver) {
        if (key == "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key == "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key, receiver);
        // 如果是浅处理，则直接返回该属性值
        if (isShallow) {
            return res;
        }
        // 否则根据isReadonly参数判断返回深响应还是深只读
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
/**
 * set处理函数
 */
function createdSetter() {
    return function set(target, key, value, receiver) {
        // 依赖触发
        let oldValue = target[key];
        let res = Reflect.set(target, key, value, receiver);
        // 当赋值了一个跟属性值本身相同的数据时不做处理
        // 且因为NaN !== NaN 所以新值和旧值必须有一项自身相等才能符合条件
        if (oldValue !== value && (oldValue === oldValue || value === value)) {
            trigger(target, key);
        }
        return res;
    };
}
function createdHasFn() {
    return function has(target, key) {
        let res = Reflect.has(target, key);
        return res;
    };
}
// reactive的代理的处理器
const mutableHandler = {
    get,
    set,
    has
};
// shallowReactive的代理的处理器
extend({}, mutableHandler, {
    get: shallowReactiveGet
});
// readonly的代理的处理器
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value, receiver) {
        console.warn(`The target ${target} cannot be changed, because it's readonly`);
        return true;
    },
    has
};
// shallowReadonly的代理处理器，这里由于set和readonlyHandler相同所以用属性值覆盖优化了代码
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
});

function createActiveObject(raw, baseHandler) {
    return new Proxy(raw, baseHandler);
}
/**
 * 深响应式对象
 * @param raw 做深只读响应的对象（未经proxy代理的对象）
 */
function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
/**
 * 深只读对象
 * @param raw 做深只读处理的对象（未经proxy代理的对象）
 */
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
/**
 * 浅只读对象
 * @param raw 做浅只读处理的对象（未经proxy代理的对象）
 */
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // TODO: attrs 普通属性
}

function emit(instance, event, ...arg) {
    console.log("event", event);
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...arg);
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    $slots: i => i.slots
};
// 处理组件代理对象获取setup返回的数据对象以及$el属性值
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    if (children && typeof children == "object") {
        for (const key in children) {
            const value = children[key];
            if (value) {
                slots[key] = (props) => normalizeSlotValue(value(props));
            }
        }
    }
}
function normalizeSlotValue(value) {
    return isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const instance = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
    };
    instance.emit = emit;
    return instance;
}
function setupComponent(instance) {
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
    { _: instance }, PublicInstanceProxyHandlers);
    const { setup } = component;
    // 如果组件存在setup函数则对其返回结果进行处理
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit.bind(null, instance),
        });
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setup返回的可能是数据对象也可能是函数（视为render函数）
    // TODO: 处理function情况
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

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof children == "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    if (vnode.shapeFlag && 2 /* STATEFUL_COMPONENT */) {
        if (typeof children == "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type == "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

function render(vnode, container) {
    // render函数里做patch打补丁操作来生成/更新/删除真实DOM
    patch(vnode, container);
}
function patch(vnode, container) {
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
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container);
            }
            break;
    }
}
function processElement(vnode, container) {
    // 初始化element
    mountElement(vnode, container);
    // TODO: 更新element
}
function processComponent(vnode, container) {
    // 初始化组件
    mountComponent(vnode, container);
    // TODO: 更新组件
}
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.appendChild(textNode);
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    // 根据type生成指定的标签元素
    const el = (vnode.el = document.createElement(type));
    if (props && isObject(props)) {
        for (const key in props) {
            // 如果key为on开头则表示是注册一个事件
            const isOn = (key) => /^on[A-Z]/.test(key);
            if (isOn(key)) {
                const event = key.slice(2).toLowerCase();
                el.addEventListener(event, props[key]);
            }
            else {
                el.setAttribute(key, props[key]);
            }
        }
    }
    if (vnode.shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (vnode.shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    container.appendChild(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function mountComponent(initialVNode, container) {
    // 生成组件实例
    const instance = createComponentInstance(initialVNode);
    // 处理组件的数据状态（reactive/ref/props/slots等）处理渲染函数等
    setupComponent(instance);
    // 处理完组件的相应书数据和渲染函数后就可以开始执行render函数进行递归patch了
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subtree = instance.render.call(proxy);
    //会的虚拟节点树后，循环调用去生成真实dom
    patch(subtree, container);
    // 将组件的根节点赋值给vnode.el以便$el来获取
    initialVNode.el = subtree.el;
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
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name = "default", props, slotContent) {
    const slot = slots[name];
    if (slot && typeof slot == "function") {
        return h(Fragment, {}, slot(props));
    }
    else if (slotContent && typeof slotContent == "function") {
        return h(Fragment, {}, slotContent());
    }
}

export { createApp, createTextVNode, h, renderSlots };
