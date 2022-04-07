import { h } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  render() {
    return h("ol", {
      class: 'red'
    }, [
      h("li", null, this.msg[0]),
      h("li", null, this.msg[1]),
      h("li", null, this.msg[2])
    ]);
  },
  setup() {
    const msg = ['Vue', 'Vite', 'Typescript'];
    return { msg };
  },
};
