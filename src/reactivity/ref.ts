import { hasChange, isObject } from "../shared";
import { trackEffects, triggerEffects, isTracking } from "./effect";
import { reactive } from "./reactive";

class RefImpl {
  private _value: any; //ref的值
  public deps; // ref对象收集的依赖容器
  private _rawValue: any; // 未经会处理的对象
  private _v_isRef = true; // 判断是否为re对象的标志
  constructor(value: any) {
    this._rawValue = value; //将未处理的对象赋值给_rawValue
    this._value = convert(value);
    this.deps = new Set(); // 没新建一个ref对象就会给这个对象创建一个收集依赖的空容器
  }
  get value() {
    // 收集依赖并返回value值
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    // 如果value值没有更改则return 否则将未处理的值和处理过的值分别存储，并触发依赖
    if (!hasChange(newValue, this._rawValue)) return;
    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.deps);
  }
}

function convert(value) {
  // 如果传给ref的值是对象则返回响应式对象，否则返回本身
  return isObject(value) ? reactive(value) : value;
}

/**
 * 如果当前可以收集依赖则收集跟当前ref对象有关的依赖
 * @param ref ref对象
 */
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.deps);
  }
}

/**
 * ref对象
 * @param value 要转换为ref对象的数据
 * @returns ref对象
 */
export function ref(value?: unknown) {
  return new RefImpl(value);
}

/**
 * 判断一个数据是否为ref对象
 * @param value 判断是否为ref对象的数据
 * @returns boolean值，true表示是，false表示否
 */
export function isRef(value): Boolean {
  return !!value._v_isRef;
}

/**
 * 如果一个值是ref对象则返回他的value属性值，否则返回本身
 * @param value ref对象/原始数据
 * @returns 数据的值
 */
export function unRef(value) {
  return isRef(value) ? value.value : value;
}

/**
 * 接受一个对象 若对象某个属性值为ref对象则访问时返回其value属性值否则返回本身
 * @param value 一个对象
 * @returns 一个代理对象
 */
export function proxyRefs(value) {
  return new Proxy(value, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    }
  })
}