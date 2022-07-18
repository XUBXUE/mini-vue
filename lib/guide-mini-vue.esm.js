function toDisplayString(value) {
    return String(value);
}

const extend = Object.assign;
const isObject = (value) => {
    return typeof value === "object" && value !== null;
};
const isArray = Array.isArray;
const isString = (value) => typeof value == "string";
const hasOwn = (value, key) => {
    return Object.prototype.hasOwnProperty.call(value, key);
};
const hasChange = (newValue, oldValue) => {
    return !Object.is(newValue, oldValue);
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
const EMPTY_OBJ = {};

const Fragment = Symbol("Fragment"); // Fragment类型
const Text = Symbol("Text"); // Text文本类型
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
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

function h(type, props, children) {
    return createVNode(type, props, children);
}

/**
 *
 * @param slots 组件的所有插槽
 * @param name 具名插槽的name
 * @param props 作用域插槽的值
 * @param slotContent 插槽的默认内容
 * @returns 返回插槽的内容
 */
function renderSlots(slots, name = "default", props, slotContent) {
    const slot = slots[name];
    // 插槽内容用fragment节点渲染，这样不会给插槽生成额外的父级包裹节点
    if (slot && typeof slot == "function") {
        return h(Fragment, {}, slot(props));
    }
    else if (slotContent && typeof slotContent == "function") {
        return h(Fragment, {}, slotContent());
    }
}

//创建全局变量 响应式对象的依赖收集容器
const targetsMap = new Map();
//当前收集的依赖副作用
let activeEffect;
//是否应该收集依赖
let shouldTrack;
// effect实例类
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = []; // 被存放的dep容器集合
        this.active = true; // 表示是否被stop停止依赖相应
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 如果没有被停止依赖相应
        if (!this.active) {
            return this._fn();
        }
        // 获取当前effect实例
        activeEffect = this;
        shouldTrack = true;
        const result = this._fn();
        shouldTrack = false;
        // 返回这个副作用函数的返回结果
        return result;
    }
    stop() {
        // 如果是true则表示没有调用过stop
        if (this.active) {
            // 对所有dep容器清除该副作用实例
            cleanupEffect(this);
            // 如果存在stop回调函数则调用
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
/**
 * 将存放着该副作用实例的dep容器清除此实例
 * @param effect
 */
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
/**
 * @returns 当activeEffect不为undefined且shouldTrack为true时，可以收集依赖
 */
function isTracking() {
    // 当仅仅只是单独获取响应式数据时，并不会触发effect()函数
    // 此时的activeEffect很有可能是undefined
    // 不应该track时直接return
    return shouldTrack && activeEffect != undefined;
}
/**
 * 收集依赖函数
 * @param target 响应式对象
 * @param key 对象属性名
 */
function track(target, key) {
    // 是否处于可收集状态
    if (!isTracking())
        return;
    // 根据对象获取对应的依赖容器
    let depsMap = targetsMap.get(target);
    // 如果还没有创建就创建一个并set到targetsMap里
    if (!depsMap) {
        targetsMap.set(target, (depsMap = new Map()));
    }
    // 获取依赖
    let dep = depsMap.get(key);
    // 如果没有则创建一个set集合作为容器并添加到depsMap容器里
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果dep中存在当前activeEffect则不用收集
    if (dep.has(activeEffect))
        return;
    // 把effct添加到set集合里
    dep.add(activeEffect);
    // 将副作用实例对应的dep容器反存到本身实例对象中，以供后面做清除使用
    activeEffect.deps.push(dep);
}
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
/**
 * 副作用
 * @param fn 副作用函数
 */
function effect(fn, options = {}) {
    // 创建effect实例 将fn存在当前实例中
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    // 调用该实例的run函数来执行fn函数
    _effect.run();
    const runner = _effect.run.bind(_effect);
    // 给此runner添加effect属性并赋值当前副作用实例
    runner.effect = _effect;
    // 返回这个run函数 来使外部使用
    return runner;
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
        // 如果是只读对象则不处罚收集依赖函数
        if (!isReadonly) {
            track(target, key); // 收集依赖
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
        track(target, key);
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
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...arg);
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
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
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    // 组件内容是slot
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
// 将slots格式化
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

class RefImpl {
    constructor(value) {
        this._v_isRef = true; // 判断是否为re对象的标志
        this._rawValue = value; //将未处理的对象赋值给_rawValue
        this._value = convert(value);
        this.deps = new Set(); // 没新建一个ref对象就会给这个对象创建一个收集依赖的空容器
    }
    get value() {
        // 收集依赖并返回value值
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果value值没有更改则return 否则将未处理的值和处理过的值分别存储，并触发依赖
        if (!hasChange(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.deps);
    }
}
function convert(value) {
    // 如果传给ref的值是对象则返回响应式对象，否则返回本身
    return isObject(value) ? reactive(value) : value;
}
/**
 * 如果当前可以收集依赖则收集跟当前ref对象有关的依赖
 * @param ref ref对象
 */
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.deps);
    }
}
/**
 * ref对象
 * @param value 要转换为ref对象的数据
 * @returns ref对象
 */
function ref(value) {
    return new RefImpl(value);
}
/**
 * 判断一个数据是否为ref对象
 * @param value 判断是否为ref对象的数据
 * @returns boolean值，true表示是，false表示否
 */
function isRef(value) {
    return !!value._v_isRef;
}
/**
 * 如果一个值是ref对象则返回他的value属性值，否则返回本身
 * @param value ref对象/原始数据
 * @returns 数据的值
 */
function unRef(value) {
    return isRef(value) ? value.value : value;
}
/**
 * 接受一个对象 若对象某个属性值为ref对象则访问时返回其value属性值否则返回本身
 * @param value 一个对象
 * @returns 一个代理对象
 */
function proxyRefs(value) {
    return new Proxy(value, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

function createComponentInstance(vnode, parent) {
    const instance = {
        vnode,
        next: null,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        subtree: {},
        isMounted: false,
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
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit.bind(null, instance),
        });
        setCurrentInstance(null);
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
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    // 获取组件对象
    const component = instance.type;
    // 如果组件实例上没有render函数，则将组件对象上的render函数赋值给组件实例
    if (compiler && !component.render) {
        if (component.template) {
            instance.render = compiler(component.template);
        }
    }
    else {
        if (component.render) {
            instance.render = component.render;
        }
    }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (currentInstance.provides == parentProvides) {
            currentInstance.provides = Object.create(parentProvides);
        }
        currentInstance.provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides[key]) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue == "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

//将根组件传递给createApp函数
function createAppApi(render) {
    return function createApp(rootComponent) {
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
    };
}

const queues = [];
let isFlushPending = false;
const p = Promise.resolve();
function queueJobs(job) {
    if (!queues.includes(job)) {
        queues.push(job);
    }
    queueFlush();
}
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueFlush() {
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
}
function flushJobs() {
    isFlushPending = false;
    let job;
    while ((job = queues.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // render函数里做patch打补丁操作来生成/更新/删除真实DOM
        patch(null, vnode, container, null, null);
    }
    function patch(n1, n2, container = null, parentComponent = null, anchor = null) {
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
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 初始化element
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("n1", n1);
        console.log("n2", n2);
        const prevProps = n1.props || EMPTY_OBJ;
        const nextProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, prevProps, nextProps);
        // TODO: 更新children
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        // patch子级元素有四种情况
        // 1. array -> text
        // 2. text -> text
        // 3. text -> array
        // 4. array -> array
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & 4 /* TEXT_CHILDREN */) {
            // 新的是text
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // 新的是text 老的是array 会先把所有array中的元素移除
                unmountChildren(c1);
            }
            // 不管旧的是array还是text  只要与新的不相同就会重新填写文本内容，因为这里的条件是 新的是textc
            if (c1 != c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // 新的是array
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                // 新的是array 旧的是text
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // 新的是array 旧的也是array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    // diff算法
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
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
        function isSameVNodeType(n1, n2) {
            return n1.type == n2.type && n1.key == n2.key;
        }
        // 1.左侧对比 这里取到了从左侧开始节点不同的位置索引 i
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
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
            }
            else {
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
        }
        else if (i > e2) {
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
        }
        else {
            // 5. 对比中间内容
            // i为获取到子级节点中间部分的数组的开始索引
            let s1 = i; //旧children的中间部分的开始索引
            let s2 = i; //新children的中间部分的开始索引
            const toBePatched = e2 - s2 + 1; //新的chilren里所需要对比的元素个数
            let patched = 0; // 当前patch了几个新的children里的元素
            const keyToNewIndexMap = new Map(); // 保存根据新children中间部分每个元素的key和索引位置的映射关系
            const newKeyToOldKeyMap = new Array(toBePatched);
            for (let i = 0; i < toBePatched; i++)
                newKeyToOldKeyMap[i] = 0;
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
                }
                else {
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
                }
                else {
                    if (nextIndex > maxNewIndexSoFar) {
                        maxNewIndexSoFar = nextIndex;
                    }
                    else {
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
                }
                else if (move) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
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
    function processComponent(n1, n2, container, parentComponent) {
        if (!n1) {
            // 初始化组件
            mountComponent(n2, container, parentComponent);
        }
        else {
            updateComponent(n1, n2);
        }
        // TODO: 更新组件
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }
    // fragment节点直接处理children内容
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    // text文本节点直接生成一个text节点的dom添加到容器里
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.appendChild(textNode);
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        const { type, props, children, shapeFlag } = vnode;
        // 根据type生成指定的标签元素
        const el = (vnode.el = hostCreateElement(type));
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
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
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 生成组件实例
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        // 处理组件的数据状态（reactive/ref/props/slots等）处理渲染函数等
        setupComponent(instance);
        // 处理完组件的相应书数据和渲染函数后就可以开始执行render函数进行递归patch了
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("初始化阶段，生成subtree并patch生成真实DOM");
                const { proxy } = instance;
                // 第一个proxy为绑定this上下文 第二个为编译后的渲染函数提供的第一个参数（_ctx）
                const subtree = (instance.subtree = instance.render.call(proxy, proxy));
                //生成虚拟节点树后，对节点树进行patch生成真实dom
                patch(null, subtree, container, instance, null);
                // 将组件的根节点赋值给vnode.el以便$el来获取
                initialVNode.el = subtree.el;
                instance.isMounted = true;
            }
            else {
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
        }, {
            scheduler() {
                queueJobs(instance.update);
            },
        });
    }
    return {
        createApp: createAppApi(render),
    };
}
function updateComponentPreRender(instance, nextVNode) {
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
function getSequence(arr) {
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
                }
                else {
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

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    // 如果key为on开头则表示是注册一个事件
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null);
}
function remove(el) {
    const parent = el.parentNode;
    if (parent) {
        parent.removeChild(el);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVnode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    extend: extend,
    isObject: isObject,
    isArray: isArray,
    isString: isString,
    hasOwn: hasOwn,
    hasChange: hasChange,
    camelize: camelize,
    toHandlerKey: toHandlerKey,
    EMPTY_OBJ: EMPTY_OBJ,
    ref: ref
});

const TO_DISPLAY_STRING = Symbol("toDisplayString");
const CREATE_ELEMENT_VNODE = Symbol("createElementVnode");
const helpersMapName = {
    [TO_DISPLAY_STRING]: "toDisplayString",
    [CREATE_ELEMENT_VNODE]: "createElementVnode",
};

function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    genFunctionPreamble(ast, context);
    const functionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    push(`function ${functionName}(${signature}) {`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    return {
        code: context.code,
    };
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const vueBinging = "Vue";
    const aliasHelper = (i) => `${helpersMapName[i]}: _${helpersMapName[i]}`;
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${vueBinging}`);
    }
    push("\n");
    push("return ");
}
function genNode(node, context) {
    switch (node.type) {
        case 3 /* TEXT */:
            genText(node, context);
            break;
        case 0 /* INTERPOLATION */:
            genInterpolation(node, context);
            break;
        case 1 /* SIMPLE_EXPRESSION */:
            genExpression(node, context);
            break;
        case 2 /* ELEMENT */:
            genElement(node, context);
            break;
        case 5 /* COMPOUND_EXPRESSION */:
            genCompoundExpression(node, context);
            break;
    }
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node; // 由于实现简易版 只有一个符合类型的子节点
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    // genNode(children, context);
    genNodeList(genNullable([tag, props, children]), context);
    // const child = children[0]; // 由于实现简易版 只有一个符合类型的子节点 所以直接取0索引
    // for (let i = 0; i < children.length; i++) {
    //   const child = children[i];
    //   genNode(child, context);
    // }
    // genNode(child, context);
    push(")");
}
function genCompoundExpression(node, context) {
    const { push } = context;
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helpersMapName[key]}`;
        },
    };
    return context;
}
function genNullable(args) {
    return args.map((arg) => arg || "null");
}
function genNodeList(args, context) {
    const { push } = context;
    for (let i = 0; i < args.length; i++) {
        const node = args[i];
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < args.length - 1) {
            push(", ");
        }
    }
}

function baseParse(content) {
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    while (!isEnd(context, ancestors)) {
        let node;
        if (context.source.startsWith("{{")) {
            node = parseInterpolation(context);
        }
        else if (context.source[0] == "<") {
            if (/[a-z]/i.test(context.source[1])) {
                node = parseElement(context, ancestors);
            }
        }
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function parseText(context) {
    let endIndex = context.source.length;
    const endTokens = ["{{", "<"];
    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if (~index && endIndex > index) {
            endIndex = index;
        }
    }
    const content = parseTextData(context, endIndex);
    return {
        type: 3 /* TEXT */,
        content,
    };
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    advanceBy(context, length);
    return content;
}
function parseElement(context, ancestors) {
    const element = parseTag(context, 0 /* START */);
    ancestors.push(element);
    // 处理标签中间部分
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* END */);
    }
    else {
        throw new Error(`缺少结束标签:${element.tag}`);
    }
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return source.slice(2, 2 + tag.length) == tag;
}
function parseTag(context, type) {
    const tagReg = /^<\/?([a-z]*)/i;
    const match = tagReg.exec(context.source);
    const tag = match[1];
    advanceBy(context, match[0].length + 1);
    if (type == 1 /* END */)
        return;
    return {
        type: 2 /* ELEMENT */,
        tag,
    };
}
function parseInterpolation(context) {
    const openDelimiter = "{{";
    const closeDelimiter = "}}";
    // 获取插值结束符号的索引位置
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    // 将插值开始符号去除（推进操作）
    advanceBy(context, openDelimiter.length);
    // 获取插值表达式的长度
    const rawContentLength = closeIndex - openDelimiter.length;
    // 截取插值表达式
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    // 推进
    advanceBy(context, closeDelimiter.length);
    return {
        type: 0 /* INTERPOLATION */,
        content: {
            type: 1 /* SIMPLE_EXPRESSION */,
            content: content,
        },
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
function createRoot(children) {
    return {
        children,
        type: 4 /* ROOT */,
        codegenNode: null,
        helpers: [],
    };
}
function createParserContext(content) {
    return {
        source: content,
    };
}

function transform(root, options = {}) {
    const context = createTransfromContext(root, options);
    traverseNode(context.root, context);
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root) {
    // 由于实现的是简易版的compiler，只有一个复合类型子节点 所以取0索引
    const child = root.children[0];
    if (child.type == 2 /* ELEMENT */) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case 0 /* INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING);
            break;
        case 4 /* ROOT */:
        case 2 /* ELEMENT */:
            traversChildren(node, context);
            break;
    }
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traversChildren(node, context) {
    const children = node.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            traverseNode(node, context);
        }
    }
}
function createTransfromContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
    };
    return context;
}

function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: 2 /* ELEMENT */,
        tag,
        props,
        children,
    };
}

function transformElement(node, context) {
    if (node.type == 2 /* ELEMENT */) {
        return () => {
            const vnodeTag = `'${node.tag}'`;
            let vnodeProps;
            const vnodeChildren = node.children[0]; // 由于实现的是简易版的compiler，只有一个复合类型子节点 所以取0索引
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type == 0 /* INTERPOLATION */) {
        node.content = processsExpression(node.content);
    }
}
function processsExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return node.type == 0 /* INTERPOLATION */ || node.type == 3 /* TEXT */;
}

function transformText(node) {
    if (node.type == 2 /* ELEMENT */) {
        return () => {
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const currentChild = children[i];
                if (isText(currentChild)) {
                    for (let j = i + 1; j < children.length; j++) {
                        const nextChild = children[j];
                        if (isText(nextChild)) {
                            // 如果相邻两个节点为element或text节点，则可以组成复合表达式节点
                            // 将当前child节点更改为复合节点 并将本身添加到children里
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: 5 /* COMPOUND_EXPRESSION */,
                                    children: [currentChild],
                                };
                            }
                            // 将相邻的child节点也添加到children里
                            currentContainer.children.push(" + ");
                            currentContainer.children.push(nextChild);
                            // 去除当前相邻的节点, 并减少索引
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText],
    });
    return generate(ast);
}

function compileToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

export { EMPTY_OBJ, camelize, createApp, createVNode as createElementVnode, createRenderer, createTextVNode, extend, getCurrentInstance, h, hasChange, hasOwn, inject, isArray, isObject, isString, nextTick, provide, ref, registerRuntimeCompiler, renderSlots, toDisplayString, toHandlerKey };
