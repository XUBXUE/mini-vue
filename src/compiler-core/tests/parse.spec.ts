import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {
  // 解析插值
  describe("interpolation", () => {
    it("simple interpolation", () => {
      const content = "{{message}}";

      const ast = baseParse(content);

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });

  describe("element", () => {
    it("simple element", () => {
      const content = "<div></div>";

      const ast = baseParse(content);

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
      });
    });
  });

  describe("text", () => {
    it("simple text", () => {
      const content = "Hi, mini-vue";

      const ast = baseParse(content);

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "Hi, mini-vue",
      });
    });
  });

  test.only("hello world", () => {
    const ast = baseParse("<div>Hi, {{ message }}</div>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "Hi, ",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });
});
