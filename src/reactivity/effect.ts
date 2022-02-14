// effect实例类
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    // 获取当前effect实例
    activeEffect = this;
    // 返回这个副作用函数的返回结果
    return this._fn();
  }
}

//创建全局变量 响应式对象的依赖收集容器
const targetsMap = new Map();
//当前收集的依赖副作用
let activeEffect;

/**
 * 收集依赖函数
 * @param target 响应式对象
 * @param key 对象属性名
 */
export function track(target, key) {
  // 根据对象获取对应的依赖容器
  let depsMap = targetsMap.get(target);
  // 如果还没有创建就创建一个并set到targetsMap里
  if (!depsMap) {
    targetsMap.set(target, (depsMap = new Map()));
  }
  // 获取依赖
  let dep = depsMap.get(key);
  // 如果没有则创建一个set集合作为容器并添加到depsMap容器里
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
    // 把effct添加到set集合里
    dep.add(activeEffect);
  }
}

/**
 * 依赖触发函数
 * @param target 响应式对象
 * @param key 对象属性名
 */
export function trigger(target, key) {
  // 获取target、key对应的依赖集合
  let depsMap = targetsMap.get(target);
  let dep = depsMap.get(key);
  // 遍历执行
  for (const item of dep) {
    item.run();
  }
}

/**
 * 副作用
 * @param fn 副作用函数
 */
export function effect(fn) {
  // 创建effect实例 将fn存在当前实例中
  const _reactiveEffect = new ReactiveEffect(fn);
  // 调用该实例的run函数来执行fn函数
  _reactiveEffect.run();
  // 返回这个run函数 来使外部使用
  return _reactiveEffect.run.bind(_reactiveEffect);
}
