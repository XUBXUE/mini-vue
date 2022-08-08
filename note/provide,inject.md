## provide / inject 的实现思路

首先在初始化组件时，在 mountComponent 中执行了 createComponentInstance 生成组件实例。
生成组件实例时，实例对象会有一个 provide 属性
这个属性会存储父级节点实例的 provide，如果没有父级则保存 app 上下文的 provide
然后通过 provide 函数来进行注入
这里会对当前实例的 provide 进行初始化
因为创建实例的时候是把父级的 provide 给本身的 provide 的
所以如果 provide 和父级 provide 相同的话进行初始化 以父级 provide 对象为原型创建对象赋值给当前 provide
然后再给 provide 进行赋值 这样不会影响到父级 provide 也能通过原型链访问父级 provide
