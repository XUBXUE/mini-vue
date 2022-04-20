import { h, renderSlots } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: "Foo",
  setup() {},
  render() {
    const foo = h("p", {}, "123");
    console.log(this.$slots)
    return h("div", {}, [
      renderSlots(this.$slots, "header"),
      renderSlots(this.$slots),
      foo,
      renderSlots(this.$slots, "content"),
      renderSlots(this.$slots, "footer")
    ]);
  },
};
