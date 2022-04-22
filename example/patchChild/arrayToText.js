import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const ArrayToText = {
  name: "ArrayToText",
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;
    return { isChange };
  },
  render() {
    return this.isChange
      ? h("div", {}, [h("div", {}, "A"), h("div", {}, "B")])
      : h("div", {}, "newChildren");
  },
};
