import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 };
    const reactiver = reactive(original);
    expect(reactiver).not.toBe(original);
    expect(reactiver.foo).toBe(1);
    expect(isReactive(reactiver)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });

  it("deep reactive", () => {
    const original = { foo: { bar: 1 } };
    const reactiver = reactive(original);
    expect(isReactive(reactiver)).toBe(true);
    expect(isReactive(original)).toBe(false);
    expect(isReactive(reactiver.foo)).toBe(true);
    expect(isReactive(original.foo)).toBe(false);
  })
});