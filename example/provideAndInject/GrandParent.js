import {
  h,
  provide,
  getCurrentInstance,
} from "../../lib/guide-mini-vue.esm.js";
import { Parent } from "./Parent.js";

export const GrandParent = {
  name: "GrandParent",
  setup() {
    provide("foo", "grandParentFoo");
    provide("bar", "grandParentBar");
    const instance = getCurrentInstance();
    console.log("grandParent", instance);
  },
  render() {
    const app = h("div", {}, "grandParent");
    const parent = h(Parent);
    return h("div", {}, [app, parent]);
  },
};
