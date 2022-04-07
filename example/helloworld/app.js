import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("h1", `hello, mini-vue`);
  },
  setup() {
    const msg = "world";
    return { msg };
  },
};
