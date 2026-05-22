interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

const DEFAULT_CONFIG: DeepSeekConfig = {
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/anthropic",
  model: process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chat(
  systemPrompt: string,
  messages: ChatMessage[],
  config?: Partial<DeepSeekConfig>
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!cfg.apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const body = {
    model: cfg.model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    max_tokens: 1024,
    temperature: 0.8,
  };

  const res = await fetch(`${cfg.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // DeepSeek returns multiple content blocks: thinking + text
  // Find the text block
  const textBlock = data.content?.find?.((b: { type: string; text?: string }) => b.type === "text");
  return textBlock?.text || "";
}
