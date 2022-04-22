import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const TextToText = {
  name: "TextToText",
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;
    return { isChange };
  },
  render() {
    return this.isChange
      ? h("div", {}, "oldChildren")
      : h("div", {}, "newChildren");
  },
};
