import { h, inject, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";

export const Child = {
  name: "Child",
  setup() {
    const foo = inject("foo");
    const hh = inject("hh", "123");
    const gg = inject("gg", () => ({
      abc: "321",
    }));
    const instance = getCurrentInstance();
    console.log("child", instance);
    return {
      foo,
      hh,
      gg,
    };
  },
  render() {
    const child = h(
      "div",
      {},
      `child-foo---:${this.foo}-${this.hh}-${this.gg.abc}`
    );
    return h("div", {}, [child]);
  },
};
