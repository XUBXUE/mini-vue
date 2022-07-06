import { NodeTypes } from "./ast";

export function baseParse(content) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context));
}

function parseChildren(context) {
  const nodes: any[] = [];
  let node;
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (context.source[0] == "<") {
    node = parseElement(context);
  }
  nodes.push(node);
  return nodes;
}

function parseElement(context) {
  console.log("context.source", context.source);
  const tagReg = /^<\/?([a-z]*)/i;
  const match: any = tagReg.exec(context.source);
  console.log("match", match);
  const tag = match[1];

  console.log("context.source2", context.source);
  advanceBy(context.source, match[0].length);

  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseInterpolation(context) {
  const openDelimiter = "{{";
  const closeDelimiter = "}}";
  // 获取插值结束符号的索引位置
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  // 将插值开始符号去除（推进操作）
  advanceBy(context, openDelimiter.length);
  // 获取插值表达式的长度
  const rawContentLength = closeIndex - openDelimiter.length;
  // 截取插值表达式
  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();
  // 推进
  advanceBy(context, rawContentLength + closeDelimiter.length);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content,
    },
  };
}

function advanceBy(context: any, length) {
  context.source = context.source.slice(length);
}

function createRoot(children) {
  return {
    children,
  };
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
