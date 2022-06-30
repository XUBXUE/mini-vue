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
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
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
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "D" }, "D"),
  h("div", { key: "C", id: "prev" }, "C"),
  h("div", { key: "G" }, "G"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "F" }, "F"),
];
const newChildren = [
  h("div", { key: "A" }, "A"),
  h("div", { key: "B" }, "B"),
  h("div", { key: "G" }, "G"),
  h("div", { key: "C", id: "next" }, "C"),
  h("div", { key: "E" }, "E"),
  h("div", { key: "F" }, "F"),
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
