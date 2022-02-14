import { track, trigger } from "./effect";

/**
 *
 * @param raw 传入待处理的对象（未经proxy代理的对象）
 */
export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key);
      // 收集依赖
      track(target, key);
      return res;
    },
    set(target, key, value) {
      let res = Reflect.set(target, key, value);
      // 依赖触发
      trigger(target, key);
      return res;
    },
  });
}
