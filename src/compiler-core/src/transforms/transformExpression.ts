import { NodeTypes } from "../ast";

export function transformExpression(node) {
  if (node.type == NodeTypes.INTERPOLATION) {
    node.content = processsExpression(node.content);
  }
}
function processsExpression(node) {
  node.content = `_ctx.${node.content}`;
  return node;
}
