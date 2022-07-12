import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe("transform", () => {
  test("happy path", () => {
    const ast = baseParse("<div>Hi,{{message}}</div>");

    const plugin = (node) => {
      if (node.type == NodeTypes.TEXT) {
        node.contnt += " mini-vue";
      }
    };

    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0].content;
    expect(nodeText).toBe("Hi, mini-vue");
  });
});
