import { getCurrentInstance } from "./component";

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const { provides } = currentInstance;
    provides[key] = value;
  }
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvices = currentInstance.parent.provice;
    return parentProvices[key];
  }
}
