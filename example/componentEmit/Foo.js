import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add', 1, 2, 3);
      emit('add-foo', 1, 2, 3);
    };
    return { emitAdd };
  },
  render() {
    const Button = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const Foo = h("p", {}, "Foo");
    return h("div", {}, [Button, Foo]);
  },
};
