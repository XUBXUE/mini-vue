import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helpersMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;

  genFunctionPreamble(ast, context);

  const functionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");

  push(`function ${functionName}(${signature}) {`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");

  return {
    code: context.code,
  };
}

function genFunctionPreamble(ast, context) {
  const { push } = context;
  const vueBinging = "Vue";
  const aliasHelper = (i) => `${helpersMapName[i]}: _${helpersMapName[i]}`;
  if (ast.helpers.length > 0) {
    push(
      `const { ${ast.helpers.map(aliasHelper).join(", ")} } = ${vueBinging}`
    );
  }
  push("\n");
  push("return ");
}

function genNode(node: any, context: any) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
    default:
      break;
  }
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}

function genElement(node: any, context: any) {
  const { push, helper } = context;
  const { tag, children } = node;
  push(`${helper(CREATE_ELEMENT_VNODE)}('${tag}', null, `);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    genNode(child, context);
  }
  push(")");
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  const { children } = node;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helpersMapName[key]}`;
    },
  };
  return context;
}
