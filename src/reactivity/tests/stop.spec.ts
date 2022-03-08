import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("test stop", () => {
  it("happy path", () => {
    let sum;
    const obj = reactive({ foo: 1});
    const runner = effect(() => {
      sum = obj.foo + 1;
    });
    // 1+1 = 2
    expect(sum).toBe(2);
    obj.foo = 2;
    // 1+2 = 3
    expect(sum).toBe(3);
    // 调用stop函数阻止副作用函数运行
    stop(runner);
    // 这里设置3后 sum按理说为1+3=4，但副作用函数已被停止，所以还为3
    obj.foo = 3;
    expect(sum).toBe(3);
    // 这里设置4后，执行runner副作用函数激活此副作用。所以sum=1+4=5
    obj.foo = 4;
    runner();
    expect(sum).toBe(5);
  });
  
  it("stop", () => {
    let sum;
    const obj = reactive({ foo: 1});
    const onStop = jest.fn(() => {
      console.log('onStoped!');
    })
    const runner = effect(() => {
      sum = obj + 1;
    }, {
      onStop
    });
    
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  })
});