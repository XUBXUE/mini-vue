import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (currentInstance.provides == parentProvides) {
      currentInstance.provides = Object.create(parentProvides);
    }
    currentInstance.provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (parentProvides[key]) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue == "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
