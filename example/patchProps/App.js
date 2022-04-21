import { h, ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  setup() {
    const obj = ref({
      foo: "foo",
      bar: "bar",
    });
    const changeBar = () => {
      obj.value.bar = "bar-new";
    };
    const emptyBar = () => {
      obj.value.bar = undefined;
    };
    const deleteBar = () => {
      obj.value = {
        foo: "foo",
      };
    };
    const addBar = () => {
      obj.value = {
        foo: "foo",
        bar: "bar",
      };
    };

    return {
      obj,
      changeBar,
      emptyBar,
      deleteBar,
      addBar
    };
  },
  render() {
    return h("div", { ...this.obj }, [
      h("button", { onClick: this.changeBar }, "changeBar"),
      h("button", { onClick: this.emptyBar }, "emptyBar"),
      h("button", { onClick: this.deleteBar }, "deleteBar"),
      h("button", { onClick: this.addBar }, "addBar"),
    ]);
  },
};
