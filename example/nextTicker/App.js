import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const instance = getCurrentInstance();
    const update = async () => {
      for (let i = 0; i < 100; i++) {
        count.value = i;
        console.log("update");
      }
      // 第一种用法
      nextTick(() => {
        console.log(instance);
      });
      // 第二种用法
      // await nextTick();
      // console.log(instance);
    };
    return {
      count,
      update,
    };
  },
  render() {
    const button = h("button", { onClick: this.update }, "update");
    const p = h("p", {}, `count: ${this.count}`);
    return h("div", {}, [button, p]);
  },
};
