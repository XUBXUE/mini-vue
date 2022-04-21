import { createVNode } from "./vnode"

//将根组件传递给createApp函数
export function createAppApi(render) {
  return function createApp(rootComponent) {
    // 返回应用实例实例
    return {
      // 其中组件实例包含一个叫mount的方法来挂载组件，接受一个挂载容器参数
      mount(rootContainer) {
        if (typeof rootContainer == 'string') {
          rootContainer = document.querySelector(rootContainer)
        }
        // 先将根组件转换成VNode，再基于VNode做处理
        const vnode = createVNode(rootComponent)
        // 将vnode传递给渲染函数做组件的配置处理
        render(vnode, rootContainer)
      }
    }
  }
}