import { effect } from "../effect";
import { reactive } from "../reactive";

describe("test scheduler", () => {
    it("happy path", () => {
        let dummy;
        let run;
        const scheduler = jest.fn(() => {
            run = runner;
        });
        let obj = reactive({ foo: 1});
        const runner = effect(() => {
            dummy = obj.foo;
        }, { scheduler });

        // 当触发effec时，立即执行参数1的回调函数
        // 并不会执行参数2里的scheduler函数
        expect(scheduler).not.toHaveBeenCalled();
        // 所以dummy被赋值 1
        expect(dummy).toBe(1);
        // 当响应式数据发生变化时，不再去执行副作用函数（参数1函数），而去执行参数2里的scheduler函数
        obj.foo++;
        // 所以这里被执行了一次
        expect(scheduler).toHaveBeenCalledTimes(1);
        // 因为没有执行副作用函数（参数1函数），所以dummy没有被赋值
        expect(dummy).not.toBe(2);
        // 因为执行了scheduler函数，所以run被赋值为runner，而runner是effect的副作用函数（参数1函数），所以这里相当于调用了副作用函数
        run();
        // 所以dummy被赋值为2了
        expect(dummy).toBe(2);

    });
});