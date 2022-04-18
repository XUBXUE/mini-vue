import { h } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";
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
        h("li", null, [
          h(Foo, {
            title: this.msg[0],
          }),
        ]),
        h("li", null, [
          h(Foo, {
            title: this.msg[1],
          }),
        ]),
        h("li", null, [
          h(Foo, {
            title: this.msg[2],
          }),
        ]),
      ]
    );
  },
  setup() {
    const msg = ["Vue", "Vite", "Typescript"];
    return { msg };
  },
};
