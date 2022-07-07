import { NodeTypes } from "./ast";

const enum TagType {
  START,
  END,
}

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
    if (/[a-z]/i.test(context.source[1])) {
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);
  return nodes;
}

function parseText(context: any) {}

function parseElement(context) {
  const element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);

  return element;
}

function parseTag(context: any, type: TagType) {
  const tagReg = /^<\/?([a-z]*)/i;
  const match: any = tagReg.exec(context.source);
  const tag = match[1];

  advanceBy(context, match[0].length + 1);

  if (type == TagType.END) return;

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
