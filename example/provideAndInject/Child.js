import { h, provide } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Parent.js";

export const App = {
  name: "App",
  setup() {
  },
  render() {
    const app = h("div", {}, "app");
    const foo = h(Foo);
    return h("div", {}, [app, foo]);
  },
};
