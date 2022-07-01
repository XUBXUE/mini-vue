import { h } from "../../lib/guide-mini-vue.esm.js";

export const Child = {
  name: "Child",
  setup() {},
  render() {
    return h("div", {}, this.$props.msg);
  },
};
