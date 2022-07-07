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
    it("happy path", () => {
      const content = "Hi, mini-vue";

      const ast = baseParse(content);

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "Hi, mini-vue",
      });
    });
  });
});
