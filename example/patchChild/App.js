import { h } from "../../lib/guide-mini-vue.esm.js";
import { ArrayToText } from "./arrayToText.js";
import { TextToText } from "./textToText.js";
import { TextToArray } from "./textToArray.js";
import { ArrayToArray } from "./arrayToArray.js";

export const App = {
  name: "App",
  setup() {},
  render() {
    return h("div", {}, [h("p", {}, "PatchChildren"),
    // 老的是array 新的是text
    // h(ArrayToText),
    // 老的是text 新的也是text
    // h(TextToText),
    // 老的是text 新的是array
    // h(TextToArray),
    // 老的是array 新的也是array
    h(ArrayToArray),
  ]);
  },
};
