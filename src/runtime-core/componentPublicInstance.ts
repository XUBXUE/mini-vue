const publicPropertiesMap = {
  $el: i => i.vnode.el
}

// 处理组件代理对象获取setup返回的数据对象以及$el属性值
export const PublicInstanceProxyHandlers = {
  get({_: instance}, key) {
    const { setupState } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}