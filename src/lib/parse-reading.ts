export interface CardReadingSection {
  position: "past" | "present" | "future";
  label: string;
  interpretation: string;
}

export interface SectionedReading {
  summary: string;
  cardReadings: CardReadingSection[];
}

const SECTION_MARKERS = [
  { key: "summary", pattern: /【总览】/ },
  { key: "past", pattern: /【过去牌详解】/ },
  { key: "present", pattern: /【现在牌详解】/ },
  { key: "future", pattern: /【未来牌详解】/ },
] as const;

const POSITION_LABELS: Record<string, string> = {
  past: "过去",
  present: "现在",
  future: "未来",
};

export function parseSections(rawText: string): SectionedReading {
  const cleaned = rawText.trim();

  // Find marker positions
  const markerPositions: { key: string; index: number }[] = [];
  for (const marker of SECTION_MARKERS) {
    const match = marker.pattern.exec(cleaned);
    if (match) {
      markerPositions.push({ key: marker.key, index: match.index });
    }
  }

  // Sort by position in text
  markerPositions.sort((a, b) => a.index - b.index);

  const result: SectionedReading = {
    summary: "",
    cardReadings: [],
  };

  if (markerPositions.length === 0) {
    // Fallback: entire text as summary
    result.summary = cleaned;
    return result;
  }

  // Extract content between markers
  for (let i = 0; i < markerPositions.length; i++) {
    const current = markerPositions[i];
    const next = markerPositions[i + 1];
    const startIndex = current.index + (SECTION_MARKERS.find((m) => m.key === current.key)?.pattern.source.length ?? 0);
    // Actually, let's find the marker text length properly
    const markerText = cleaned.slice(current.index).match(/【[^】]+】/)?.[0] ?? "";
    const contentStart = current.index + markerText.length;
    const contentEnd = next ? next.index : cleaned.length;
    let content = cleaned.slice(contentStart, contentEnd).trim();

    // Remove leading newlines
    content = content.replace(/^\n+/, "").trim();

    if (current.key === "summary") {
      result.summary = content;
    } else {
      result.cardReadings.push({
        position: current.key as CardReadingSection["position"],
        label: POSITION_LABELS[current.key] ?? current.key,
        interpretation: content,
      });
    }
  }

  // If summary is empty but we have card readings, use first part as summary
  if (!result.summary && result.cardReadings.length > 0) {
    result.summary = "命运之牌已为你展开，点击每张牌查看详细解读。";
  }

  return result;
}
