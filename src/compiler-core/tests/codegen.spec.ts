import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";

describe("generate", () => {
  test("happy path", () => {
    const ast = baseParse("1234");
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
