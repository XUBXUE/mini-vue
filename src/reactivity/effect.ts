import { extend } from '../shared';
//创建全局变量 响应式对象的依赖收集容器
const targetsMap = new Map();
//当前收集的依赖副作用
let activeEffect;
//是否应该收集依赖
let shouldTrack;

// effect实例类
class ReactiveEffect {
  private _fn: any; // 当前副作用函数
  public scheduler: Function | undefined; // 调度函数、由调用effect时传入的options参数中获取
  deps = []; // 被存放的dep容器集合
  active = true; // 表示是否被stop停止依赖相应
  onStop?: () => void; // 调用stop时的回调、由调用effect时传入的options参数中获取
  constructor(fn, scheduler?: Function) {
    this._fn = fn;
    this.scheduler = scheduler;
  }
  run() {
    // 如果没有被停止依赖相应
    if (!this.active) {
      this._fn();
    }
    // 获取当前effect实例
    activeEffect = this;
    shouldTrack = true;
    const result = this._fn();
    shouldTrack = false;
    // 返回这个副作用函数的返回结果
    return result;
  }
  stop() {
    // 如果是true则表示没有调用过stop
    if (this.active) {
      // 对所有dep容器清除该副作用实例
      cleanupEffect(this);
      // 如果存在stop回调函数则调用
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}
/**
 * 将存放着该副作用实例的dep容器清除此实例
 * @param effect 
 */
function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
/**
 * 收集依赖函数
 * @param target 响应式对象
 * @param key 对象属性名
 */
export function track(target, key) {
  // 当仅仅只是单独获取响应式数据时，并不会触发effect()函数
  // 此时的activeEffect很有可能是undefined，所以return出去
  if (!activeEffect) return;
  // 不应该track时直接return
  if (!shouldTrack) return;

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
  }
  // 把effct添加到set集合里
  dep.add(activeEffect);
  // 将副作用实例对应的dep容器反存到本身实例对象中，以供后面做清除使用
  activeEffect.deps.push(dep);
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
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

/**
 * 副作用
 * @param fn 副作用函数
 */
export function effect(fn, options: any = {}) {
  // 创建effect实例 将fn存在当前实例中
  const _effect = new ReactiveEffect(fn, options.scheduler);
  extend(_effect, options);
  // 调用该实例的run函数来执行fn函数
  _effect.run();
  const runner: any = _effect.run.bind(_effect);
  // 给此runner添加effect属性并赋值当前副作用实例
  runner.effect = _effect;
  // 返回这个run函数 来使外部使用
  return runner;
}

/**
 * stop函数用来停止副作用函数生效
 * @param effect 副作用函数
 */
export function stop(runner) {
  // 获取当前runner里的副作用实例 该实例是在effect()函数里对runner赋值的
  const effect = runner.effect;
  // 执行该实例的stop()函数
  effect.stop();
}
