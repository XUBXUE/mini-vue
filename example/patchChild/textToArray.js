import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const TextToArray = {
  name: "TextToArray",
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;
    return { isChange };
  },
  render() {
    return this.isChange
      ? h("div", {}, "oldChildren")
      : h("div", {}, [h("div", {}, "A"), h("div", {}, "B")]);
  },
};
