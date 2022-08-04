import { NodeTypes } from "../ast";
import { isText } from "../utils";

export function transformText(node) {
  if (node.type == NodeTypes.ELEMENT) {
    return () => {
      const { children } = node;
      let currentContainer;
      for (let i = 0; i < children.length; i++) {
        const currentChild = children[i];
        if (isText(currentChild)) {
          for (let j = i + 1; j < children.length; j++) {
            const nextChild = children[j];
            if (isText(nextChild)) {
              // 如果相邻两个节点为element或text节点，则可以组成复合表达式节点
              // 将当前child节点更改为复合节点 并将本身添加到children里
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [currentChild],
                };
              }
              // 将相邻的child节点也添加到children里
              currentContainer.children.push(" + ");
              currentContainer.children.push(nextChild);
              // 去除当前相邻的节点, 并减少索引
              children.splice(j, 1);
              j--;
            } else {
              currentContainer = undefined;
              break;
            }
          }
        }
      }
    };
  }
}
