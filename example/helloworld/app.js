import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("ol", {
      class: 'red'
    }, [
      h("li", null, 'Vue'),
      h("li", null, 'Vite'),
      h("li", null, 'Typescript')
    ]);
  },
  setup() {
    const msg = "world";
    return { msg };
  },
};
