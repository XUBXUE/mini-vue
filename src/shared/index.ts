export const extend = Object.assign;

export const isObj = (value) => {
  return typeof value == 'object' && value !== null;
}