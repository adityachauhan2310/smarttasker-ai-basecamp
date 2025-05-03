// Priority detection utility for suggesting priority based on task content

const PRIORITY_KEYWORDS = {
  high: ["urgent", "asap", "immediately", "critical", "high priority", "important", "today", "now", "right away"],
  medium: ["soon", "normal", "medium priority", "regular", "this week"],
  low: ["someday", "whenever", "low priority", "optional", "later", "eventually"]
};

export function detectPriorityFromText(text: string): 'low' | 'medium' | 'high' | undefined {
  const textLower = text.toLowerCase();
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return priority as 'low' | 'medium' | 'high';
    }
  }
  return undefined;
} 