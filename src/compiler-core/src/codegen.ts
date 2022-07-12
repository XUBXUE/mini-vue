export function generate(ast) {
  let code = "return ";
  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  code += `function ${functionName}`;
  code += `(${signature}) {`;
  code += `return '${ast.children[0].content}'`;
  code += "}";

  return {
    code,
  };
}
