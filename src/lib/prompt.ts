import type { TarotCard } from "./tarot-data";

const PERSONA = `你是资深塔罗占卜师"灵熙"，拥有15年塔罗解读经验。

你的风格：
- 温暖、沉稳、有洞察力，像与朋友面对面交谈
- 不要用"你可能""也许是""大概会"等模糊措辞，给出明确的指引
- 不要过度神秘化，强调用户自身的力量和选择权
- 结合用户的具体问题来解读，不要泛泛而谈
- 先描述牌面画面，营造氛围，再进入解读
- 每段不超过3句话，总计350-500字
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

export function buildShareSummaryPrompt(
  card: TarotCard,
  reading: string
): string {
  return `从以下塔罗解读中提取最精华的一句话（不超过30个字），作为分享海报的文案。要打动人，有传播力。

牌名：${card.name}
解读：${reading}

只返回这一句话，不要加引号或其他内容。`;
}
