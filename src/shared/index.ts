export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === "object" && value !== null;
};

export const isArray = Array.isArray;

export const isString = (value) => typeof value == "string";

export const hasOwn = (value, key) => {
  return Object.prototype.hasOwnProperty.call(value, key);
};

export const hasChange = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue);
};

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};

export const EMPTY_OBJ = {};
