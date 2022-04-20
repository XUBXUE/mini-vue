import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup(props) {
    console.log("props.defaultValue", props.defaultValue);
  },
  render() {
    const foo = h("p", {}, "123");
    console.log(this.$slots);
    console.log("this.defaultValue", this.defaultValue);
    return h("div", {}, [
      renderSlots(this.$slots, "header", {}, () => [
        h("h1", { style: "color: red;" }, "我是header插槽默认值"),
      ]),
      renderSlots(this.$slots, "default", { value: this.defaultValue }),
      foo,
      renderSlots(this.$slots, "content"),
      renderSlots(this.$slots, "footer"),
    ]);
  },
};
