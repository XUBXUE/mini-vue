import { NodeTypes } from "./ast";

const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  const context = createParserContext(content);
  return createRoot(parseChildren(context, []));
}

function parseChildren(context, ancestors) {
  const nodes: any[] = [];

  while (!isEnd(context, ancestors)) {
    let node;
    if (context.source.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (context.source[0] == "<") {
      if (/[a-z]/i.test(context.source[1])) {
        node = parseElement(context, ancestors);
      }
    }

    if (!node) {
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}

function isEnd(context, ancestors) {
  const s = context.source;
  if (s.startsWith("</")) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag;
      if (startsWithEndTagOpen(s, tag)) {
        return true;
      }
    }
  }
  return !s;
}

function parseText(context: any) {
  let endIndex = context.source.length;
  const endTokens = ["{{", "<"];

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i]);
    if (~index && endIndex > index) {
      endIndex = index;
    }
  }
  const content = parseTextData(context, endIndex);

  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseTextData(context: any, length: number) {
  const content = context.source.slice(0, length);
  advanceBy(context, length);
  return content;
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.START);
  ancestors.push(element);
  // 处理标签中间部分
  element.children = parseChildren(context, ancestors);
  ancestors.pop();
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.END);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }

  return element;
}

function startsWithEndTagOpen(source, tag) {
  return source.slice(2, 2 + tag.length) == tag;
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
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();
  // 推进
  advanceBy(context, closeDelimiter.length);

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
    type: NodeTypes.ROOT,
    codegenNode: null,
    helpers: [],
  };
}

function createParserContext(content: string) {
  return {
    source: content,
  };
}
