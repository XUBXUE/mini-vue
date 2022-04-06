import { ReactiveEffect } from "./effect";

class ComputedRefImpl {
  private _getter: any;
  private _dirty: boolean = true;
  private _value: any;
  private _effct: any;
  constructor(getter) {
    this._getter = getter;
    this._effct = new ReactiveEffect(getter, () => {
      if(!this._dirty) {
        this._dirty = true;
      }
    })
  }
  get value() {
    if (this._dirty) {
      this._dirty = false
      this._value = this._effct.run();
    }
    return this._value
  }
}

export function computed(getter) {
  return new ComputedRefImpl(getter);
}
