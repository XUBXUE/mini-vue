import { NodeTypes } from "./ast";

export function transform(root, options) {
  createTransfromContext(root, options);
  traverseNode(root);
}

function traverseNode(node: any) {
  if (node.type == NodeTypes.TEXT) {
    node.content += " mini-vue";
  }

  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node);
    }
  }
}

function createTransfromContext(root, options) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
}
