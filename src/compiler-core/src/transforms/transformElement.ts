import { createVNodeCall, NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node, context) {
  if (node.type == NodeTypes.ELEMENT) {
    return () => {
      const vnodeTag = `'${node.tag}'`;

      let vnodeProps;

      const vnodeChildren = node.children[0]; // 由于实现的是简易版的compiler，只有一个复合类型子节点 所以取0索引

      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}
