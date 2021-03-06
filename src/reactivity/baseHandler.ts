import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

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
    if (key == ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key == ReactiveFlags.IS_READONLY) {
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
  }
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
    if(oldValue !== value && (oldValue === oldValue || value === value)) {
      trigger(target, key);
    }

    return res;
  }
}

function createdHasFn() {
  return function has(target, key) {
    let res = Reflect.has(target, key);
    track(target, key);
    return res;
  }
}


// reactive的代理的处理器
export const mutableHandler = {
  get,
  set,
  has
};

// shallowReactive的代理的处理器
export const shallowMutableHandler = extend({}, mutableHandler, {
  get: shallowReactiveGet
})

// readonly的代理的处理器
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value, receiver) {
    console.warn(`The target ${target} cannot be changed, because it's readonly`);
    return true;
  },
  has
};

// shallowReadonly的代理处理器，这里由于set和readonlyHandler相同所以用属性值覆盖优化了代码
export const shallowReadonlyHandler = extend({}, readonlyHandler, {
  get: shallowReadonlyGet
});

