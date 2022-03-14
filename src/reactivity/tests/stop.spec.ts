import { effect, stop } from "../effect";
import { reactive } from "../reactive";

describe("test stop", () => {
  it("stop", () => {
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
    // 这里应为调用了obj.foo++ 相当于obj.foo = obj.foo + 1，这里即触发了obj.foo的get也触发了set
    // 由于触发get时当前的activeEffect为上面的副作用函数，所以get会收集依赖，在触发set时会触发依赖 所以运行了runner副作用函数 最终导致sum值变化了
    // 这里按理来说sum应该为3 但实际结果为5， 所以需要处理这个问题
    obj.foo++;
    // expect(sum).toBe(5); //false
    expect(sum).toBe(3); //true
    // 这里设置4后，执行runner副作用函数激活此副作用。所以sum=1+4=5
    obj.foo = 4;
    runner();
    expect(sum).toBe(5);
  });
  
  it("onStop", () => {
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