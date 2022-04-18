import { h } from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  // 1.setup函数的第一个参数获取到props
  setup(props) {
    console.log(props.title)
    // 3. props是一个shallowReadonly对象 对他修改不会发生改变
    props.title = 'changed';
  },
  render() {
    // 2.通过this可以获取到props对象中的属性
    return h('div', {}, 'Foo is:' + this.title)
  }
};
