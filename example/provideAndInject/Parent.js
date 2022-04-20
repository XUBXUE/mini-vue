import { h, inject } from "../../lib/guide-mini-vue.esm.js";

export const Parent = {
  name: "Parent",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");

    return { foo, bar };
  },
  render() {
    const foo = h("p", {}, `parent-${this.foo}-${this.bar}`);
    return h("div", {}, [foo]);
  },
};
