import { h, ref } from "../../lib/guide-mini-vue.esm.js";
import { Child } from "./Child.js";

export const App = {
  name: "App",
  setup() {
    const msg = ref("我是child props");
    const count = ref(1);
    const changeMsg = () => {
      msg.value = "我改变了";
    };
    const changeCount = () => {
      count.value++;
    };
    return {
      msg,
      count,
      changeCount,
      changeMsg,
    };
  },
  render() {
    return h("div", {}, [
      h("div", {}, "你好"),
      h("button", { onClick: this.changeMsg }, "change child msg"),
      h(Child, { msg: this.msg }),
      h("button", { onClick: this.changeCount }, "change count"),
      h("div", {}, "count is" + this.count),
    ]);
  },
};
