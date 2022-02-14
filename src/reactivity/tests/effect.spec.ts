import { reactive } from "../reactive";
import { effect } from "../effect";

describe("effect", () => {
  it("happy path", () => {
    const me = reactive({
      age: 24,
    });

    let nextAge;

    effect(() => {
      nextAge = me.age + 1;
    });

    expect(nextAge).toBe(25);

    me.age++;

    expect(nextAge).toBe(26);
  });

  it("test runner", () => {
    let foo = 10;

    // 这里执行effect函数后会先执行传进去的函数然后返回该函数
    // 返回的函数赋值给了runner
    const runner = effect(() => {
      foo++;
      return 'foo';
    });

    expect(foo).toBe(11);

    // 这里调用了runner函数相当于调用了传给effect的函数参数且获取该函数的返回值
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe('foo');
  });
});
