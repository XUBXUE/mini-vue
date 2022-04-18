export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === "object" && value !== null;
};

export const isArray = Array.isArray;

export const hasOwn = (value, key) => {
  return Object.prototype.hasOwnProperty.call(value, key);
};

export const hasChange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue);
};
