import { camelize, toHandlerKey } from "../shared";

export function emit(instance, event, ...arg) {
  console.log("event", event);
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));

  const handler = props[handlerName];
  handler && handler(...arg);
}
