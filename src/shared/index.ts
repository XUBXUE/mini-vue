export const extend = Object.assign;

export const isObject = (value) => {
  return typeof value === 'object' && value !== null;
}