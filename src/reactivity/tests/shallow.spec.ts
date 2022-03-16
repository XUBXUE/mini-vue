import { isProxy, isReactive, isReadonly, shallowReactive, shallowReadonly } from "../reactive";

describe('test shallow', () => {
  it('test shallowReadonly object', () => {
    const original = { foo: { bar: 1 } };
    const shallowReadonlyObj = shallowReadonly(original);
    expect(isReadonly(shallowReadonlyObj)).toBe(true);
    expect(isReadonly(shallowReadonlyObj.foo)).toBe(false);
    expect(isProxy(shallowReadonlyObj)).toBe(true);
    expect(isProxy(shallowReadonlyObj.foo)).toBe(false);
  });

  it('test shallowReactive object', () => {
    const original = { foo: { bar: 1 } };
    const shallowReactiveObj = shallowReactive(original);
    expect(isReactive(shallowReactiveObj)).toBe(true);
    expect(isReactive(shallowReactiveObj.foo)).toBe(false);
    expect(isProxy(shallowReactiveObj)).toBe(true);
    expect(isProxy(shallowReactiveObj.foo)).toBe(false);
  })
});