# mini-vue

实现以下功能

## reactivity（响应模块）

- [x] effect
- [x] reactive
- [x] shallowReactive
- [x] readonly
- [x] shallowReadonly
- [x] isReactive
- [x] isReadonly
- [x] isProxy
- [x] ref
- [x] isRef
- [x] unRef
- [x] computed

## runtime-core（运行时核心模块）

- [x] component 初始化流程
- [x] 组件代理对象
- [x] 实现 shapeFlags
- [x] 实现 props
- [x] 实现 emit
- [x] 实现具名插槽
- [x] 实现作用域插槽
- [x] 实现渲染 Fragment 节点
- [x] 实现渲染 Text 节点
- [x] 实现 getCurrentInstance 函数
- [x] 实现 provide 和 inject
- [x] 实现 自定义渲染器
- [x] 实现 patchProps
- [x] 实现 patchChildren（diff 算法）
- [x] 实现 nextTick
- [x] 实现更新组件功能

## runtime-dom（运行时 dom 操作模块）

- [x] 实现 createElement
- [x] 实现 patchProp
- [x] 实现 insert
- [x] 实现 remove
- [x] 实现 setElementText

## compiler-core（编译核心模块）

- [x] 实现解析 text 功能
- [x] 实现解析插值功能
- [x] 实现解析 element 功能
- [x] 实现 transform 功能
- [x] 实现根据 ast 生成 text、插值、transform 类型代码功能
- [x] 实现编译 template 为 render 函数功能
