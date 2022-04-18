import { h } from "../../lib/guide-mini-vue.esm.js";
window.self = null;
export const App = {
  render() {
    window.self = this;
    return h(
      "ol",
      {
        class: "red",
        onClick: () => {
          console.log("click");
        },
        onMousedown: () => {
          console.log("mousedown");
        },
        onMouseUp: () => {
          console.log("mouseup");
        },
      },
      [
        h("li", null, this.msg[0]),
        h("li", null, this.msg[1]),
        h("li", null, this.msg[2]),
      ]
    );
  },
  setup() {
    const msg = ["Vue", "Vite", "Typescript"];
    return { msg };
  },
};
