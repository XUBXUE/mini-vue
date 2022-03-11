import { mutableHandler, readonlyHandler } from "./baseHandler";

function createActiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler);
}

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

/**
 * 响应式对象
 * @param raw 传入待处理的对象（未经proxy代理的对象）
 */
export function reactive(raw) {
  return createActiveObject(raw, mutableHandler);
}

/**
 * 只读对象
 * @param raw 做只读处理的对象
 */
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandler);
}

export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}