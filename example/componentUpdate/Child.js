import { h } from "../../lib/guide-mini-vue.esm.js";

export const Child = {
  name: "Child",
  setup() {},
  render() {
    return h("div", {}, "我接受到的props是：" + this.$props.msg);
  },
};
