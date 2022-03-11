import { isReadonly, readonly } from "../reactive";

describe('test readonly', () => {

  it('happy path', () => {
    const obj = { foo: 1 };
    const readonlyObj = readonly(obj);
    expect(readonlyObj).not.toBe(obj);
    expect(readonlyObj.foo).toBe(1);
    expect(isReadonly(readonlyObj)).toBe(true);
    expect(isReadonly(obj)).toBe(false);
  });

  it('console warn when called readonly object setter', () => {
    console.warn = jest.fn();

    const user = readonly({
      age: 18
    });
    user.age = 19;
    
    expect(console.warn).toBeCalled();
  })
})