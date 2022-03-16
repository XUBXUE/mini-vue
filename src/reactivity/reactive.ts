import { mutableHandler, readonlyHandler, shallowReadonlyHandler, shallowMutableHandler } from "./baseHandler";

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler);
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

/**
 * 深响应式对象
 * @param raw 做深只读响应的对象（未经proxy代理的对象）
 */
export function reactive(raw) {
  return createActiveObject(raw, mutableHandler);
}

/**
 * 浅响应对象
 * @param raw 传入做浅响应的对象（未经proxy代理的对象）
 */
export function shallowReactive(raw) {
  return createActiveObject(raw, shallowMutableHandler);
}

/**
 * 深只读对象
 * @param raw 做深只读处理的对象（未经proxy代理的对象）
 */
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler);
}

/**
 * 浅只读对象
 * @param raw 做浅只读处理的对象（未经proxy代理的对象）
 */
 export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandler);
}

/**
 * 判断对象是否为响应式对象
 * @param value 待确认的对象
 */
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

/**
 * 判断对象是否为只读对象
 * @param value 待确认的对象
 */
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

/**
 * 判断对象是否为代理对象
 * @param value 待确认的对象
 */
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}