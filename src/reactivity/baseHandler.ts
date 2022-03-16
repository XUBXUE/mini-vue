import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

// 因为所有proxy用到的get或set都是一样的，所以全局声明get和set使用，防止每创建一个响应式对象或只读对象所带来的创建get和set的内存消耗
// reactive响应式对象用到的get处理函数
const get = createGetter();
// reactive响应式对象用到的set处理函数
const set = createdSetter();
// readonly只读对象用到的get处理函数
const readonlyGet = createGetter(true);

// 将readonly和reactive的get和set抽取出来
function createGetter(isReadonly = false) {
  return function get(target, key) {
    if (key == ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key == ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }
    const res = Reflect.get(target, key);
    // 如果获取的属性值是对象则返回响应式对象
    if (typeof res == 'object' && res !== null) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    // 如果是只读对象则不处罚收集依赖函数
    if (!isReadonly) {
      // 收集依赖
      track(target, key);
    }
    return res;
  }
}
function createdSetter() {
  return function set(target, key, value) {
    let res = Reflect.set(target, key, value);
    // 依赖触发
    trigger(target, key);
    return res;
  }
}


// reactive的代理的处理器
export const mutableHandler = {
  get,
  set
};

// readonly的代理的处理器
export const readonlyHandler = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`The target ${target} cannot be changed, because it's readonly`);
    return true;
  }
};

