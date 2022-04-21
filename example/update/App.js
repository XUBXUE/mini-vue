import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(1);
    const add = () => {
      count.value++;
    };

    return {
      count,
      add,
    };
  },
  render() {
    return h("div", {}, [
      h("div", {}, `count：${this.count}`),
      h(
        "button",
        {
          onClick: this.add,
        },
        "Add"
      ),
    ]);
  },
};
