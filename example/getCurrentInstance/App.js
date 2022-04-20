import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  setup() {
    const instance = getCurrentInstance();
    console.log(instance);
  },
  render() {
    const app = h("div", {}, "app");
    const foo = h(Foo);
    return h("div", {}, [app, foo]);
  },
};
