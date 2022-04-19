import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  // 1.setup函数的第一个参数获取到props
  setup() {
    return {};
  },
  render() {
    // 2.通过this可以获取到props对象中的属性
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        onAdd: (a, b, c) => {
          console.log(a, b, c);
        },
        onAddFoo: () => {
          console.log("onAddFoo");
        },
      }),
    ]);
  },
};
