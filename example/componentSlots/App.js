import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  setup() {},
  render() {
    const app = h("div", {}, "app");
    // 实现思路
    // 1.先实现单个vnode
    // const foo = h(Foo, {}, h("div", {}, "slot2"));
    // 2.实现一个renderslots函数来支持渲染一个vnode数组
    // const foo = h(Foo, {}, [h("div", {}, "slot1"), h("div", {}, "slot2")]);
    // 3.实现传入一个object类型的children来实现具名插槽
    const foo = h(
      Foo,
      {
        defaultValue: "I'm default slot"
      },
      {
        header: () => h("div", {}, "header"),
        default: ({value}) => h('h1', {}, value),
        content: () => [h("div", {}, "1"), h("div", {}, "2")],
        footer: () => h("div", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },
};
