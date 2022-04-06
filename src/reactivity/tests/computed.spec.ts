import { computed } from "../computed";
import { reactive } from "../reactive";

describe("test computed", () => {
  it("happy path", () => {
    const value = reactive({
      foo: 1,
    });
    const bar = computed(() => {
      return value.foo;
    });
    expect(bar.value).toBe(1);
  });

  it("computed lazy and cache", () => {
    const user = reactive({
      age: 1
    });
    const getter = jest.fn(() => {
      return user.age
    })
    const foo = computed(getter)
    // 这里没有读取foo.value时 getter是不会执行的 体现了computed的懒执行
    expect(getter).not.toHaveBeenCalled();
    expect(foo.value).toBe(1);
    // 这里读取了foo.value，所以getter函数执行了一次
    expect(getter).toHaveBeenCalledTimes(1);
    foo.value
    // 这里又读取了foo.value，因为原来的依赖值没有变化 所以根据computed的缓存特性 这里的getter没有执行
    expect(getter).toHaveBeenCalledTimes(1);
    user.age = 2;
    expect(getter).toHaveBeenCalledTimes(1);
    // 这里修改了依赖的值，但是dirty变为了false，导致读取foo.value时无法执行副作用函数，所以这里利用收集触发依赖和scheduler调渡函数去修改dirty的值，在读取foo.value时可以触发副作用函数
    expect(foo.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
    foo.value
    expect(foo.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  })
});
