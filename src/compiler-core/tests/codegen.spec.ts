import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";

describe("generate", () => {
  test("happy path", () => {
    const ast = baseParse("1234");
    const str = generate(ast);
    expect(str.code).toMatchSnapshot();
  });
});
