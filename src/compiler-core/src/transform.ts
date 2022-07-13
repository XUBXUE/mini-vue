export function transform(root, options = {}) {
  const context = createTransfromContext(root, options);
  traverseNode(context.root, context);
  createRootCodegen(root);
}

function createRootCodegen(root) {
  root.codegenNode = root.children[0];
}

function traverseNode(node: any, context) {
  const nodeTransforms = context.nodeTransforms;
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }

  traversChildren(node, context);
}

function traversChildren(node, context) {
  const children = node.children;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, context);
    }
  }
}

function createTransfromContext(root, options) {
  return {
    root,
    nodeTransforms: options.nodeTransforms || [],
  };
}
