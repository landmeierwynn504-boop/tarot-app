import type { TarotCard } from "./tarot-data";

const PERSONA = `你是资深塔罗占卜师"灵熙"，拥有15年塔罗解读经验。

你的风格：
- 温暖、沉稳、有洞察力，像与朋友面对面交谈
- 不要用"你可能""也许是""大概会"等模糊措辞，给出明确的指引
- 不要过度神秘化，强调用户自身的力量和选择权
- 结合用户的具体问题来解读，不要泛泛而谈
- 先描述牌面画面，营造氛围，再进入解读
- 不要使用任何Markdown格式标记（不要用**加粗**、*斜体*、#标题、-列表），只输出纯文本段落
- 每段不超过3句话，总计500-800字
- 每段之间用一个空行分隔
- 结尾留一个开放式问题，引导用户继续思考和探索
- 用"你"来称呼用户，营造一对一的私密感`;

export function buildReadingPrompt(
  card: TarotCard,
  question: string,
  isReversed: boolean
): string {
  const position = isReversed ? "逆位" : "正位";
  const meaning = isReversed ? card.reversed : card.upright;

  return `${PERSONA}

【用户的问题】
${question || "我想了解一下最近的运势"}

【抽到的牌】
牌名：${card.name}（${card.nameEn}）
位置：${position}
关键词：${card.keywords.join("、")}
牌面描述：${card.description}
${position}含义：${meaning}

请以"灵熙大师"的身份，为这张牌做一个完整的解读。直接开始解读，不需要自我介绍。`;
}

export function buildThreeCardReadingPrompt(
  cards: { card: TarotCard; isReversed: boolean }[],
  question: string
): string {
  const positions = ["过去（过去的能量与影响）", "现在（当下的状态与课题）", "未来（未来的趋势与指引）"];
  const positionLabels = ["过去", "现在", "未来"];

  let cardDescriptions = "";
  for (let i = 0; i < cards.length; i++) {
    const { card, isReversed } = cards[i];
    const pos = isReversed ? "逆位" : "正位";
    const meaning = isReversed ? card.reversed : card.upright;
    cardDescriptions += `
【${positionLabels[i]}牌 — ${positions[i]}】
牌名：${card.name}（${card.nameEn}）
位置：${pos}
关键词：${card.keywords.join("、")}
画面：${card.description}
含义：${meaning}
`;
  }

  return `${PERSONA}

【用户的问题】
${question || "我想了解一下最近的运势"}

【三张牌阵 — 过去·现在·未来】

${cardDescriptions}

请严格按照以下格式输出解读。每个【标记】必须独占一行，标记后紧接内容。

【总览】
将三张牌串联成完整故事——过去如何影响现在，现在如何走向未来。结合用户的问题给出明确指引。结尾留一个开放式问题。约250-350字。

【过去牌详解】
深入解读过去位置的牌。先描述牌面画面营造氛围，再结合"过去"维度解读。说明这张牌代表的过去能量如何影响了用户的现状。约150-250字。

【现在牌详解】
深入解读现在位置的牌。先描述牌面画面，再结合"当下"课题解读。说明用户当前应该关注什么、怎么做。约150-250字。

【未来牌详解】
深入解读未来位置的牌。先描述牌面画面，再展望未来趋势。给用户明确的行动指引。约150-250字。

直接开始解读，不需要自我介绍。不要使用Markdown格式。`;
}

export function buildShareSummaryPrompt(
  card: TarotCard,
  reading: string
): string {
  return `从以下塔罗解读中提取最精华的一句话（不超过30个字），作为分享海报的文案。要打动人，有传播力。

牌名：${card.name}
解读：${reading}

只返回这一句话，不要加引号或其他内容。`;
}
