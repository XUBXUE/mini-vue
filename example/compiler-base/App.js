import { ref } from "../../lib/guide-mini-vue.esm.js";

export const App = {
  name: "App",
  template: "<div>Hi, {{message}}</div>",
  setup() {
    const message = (window.message = ref("mini-vue"));
    return {
      message,
    };
  },
};
