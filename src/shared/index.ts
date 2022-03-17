export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === 'object' && value !== null;
}

export const hasChange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue);
}