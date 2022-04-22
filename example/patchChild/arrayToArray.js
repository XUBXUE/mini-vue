import { h, ref } from "../../lib/guide-mini-vue.esm.js";

// 左侧对比
// const oldChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B"), h("div", { key: "C" }, "C")];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
// ];

// 右侧对比
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const newChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];

// 新的比旧的多
// （对比左侧）右侧多
// const oldChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "C" }, "C"),
// ];
// （对比右侧）左侧多
// const oldChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];
// const newChildren = [
//   h("div", { key: "C" }, "D"),
//   h("div", { key: "D" }, "C"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ];

// 旧的比新的多
// （对比左侧）右侧多
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "C" }, "C"),
// ];
// const newChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];
// （对比右侧）左侧多
// const oldChildren = [h("div", { key: "A" }, "A"), h("div", { key: "B" }, "B")];
// const newChildren = [
//   h("div", { key: "C" }, "D"),
//   h("div", { key: "D" }, "C"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
// ];

// 对比中间复杂部分
const oldChildren = [
  h("div", {}, "A"),
  h("div", {}, "B"),
  h("div", {}, "D"),
  h("div", {}, "C"),
  h("div", {}, "G"),
  h("div", {}, "E"),
  h("div", {}, "F"),
];
const newChildren = [
  h("div", {}, "A"),
  h("div", {}, "B"),
  h("div", {}, "G"),
  h("div", {}, "C"),
  h("div", {}, "E"),
  h("div", {}, "F"),
];

export const ArrayToArray = {
  name: "ArrayToText",
  setup() {
    const isChange = ref(true);
    window.isChange = isChange;
    return { isChange };
  },
  render() {
    return this.isChange
      ? h("div", {}, oldChildren)
      : h("div", {}, newChildren);
  },
};
