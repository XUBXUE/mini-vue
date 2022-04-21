import { h, provide, inject, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Child } from "./Child.js";

export const Parent = {
  name: "Parent",
  setup() {
    // provide("foo", "parentFoo");
    const foo = inject("foo");
    const instance = getCurrentInstance();
    console.log("parent", instance);
    return { foo };
  },
  render() {
    const child = h(Child);
    const foo = h("p", {}, `parent-${this.foo}`);
    return h("div", {}, [foo, child]);
  },
};
