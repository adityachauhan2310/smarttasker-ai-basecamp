// Categorization utility for suggesting tags based on task content

const TAG_KEYWORDS: Record<string, string[]> = {
  work: ["meeting", "project", "deadline", "client", "office", "report", "presentation", "email"],
  personal: ["birthday", "family", "friend", "party", "call", "visit", "gift", "event"],
  shopping: ["buy", "purchase", "order", "shop", "groceries", "store", "market"],
  health: ["doctor", "appointment", "exercise", "workout", "gym", "run", "meditation", "yoga", "meds", "medicine"],
  finance: ["invoice", "bill", "payment", "pay", "salary", "budget", "expense", "tax"],
  study: ["study", "read", "homework", "assignment", "exam", "test", "course", "class", "lecture"],
  travel: ["flight", "hotel", "trip", "travel", "book", "reservation", "ticket", "journey"],
  chores: ["clean", "laundry", "wash", "dishes", "vacuum", "tidy", "organize"],
  tech: ["deploy", "code", "bug", "fix", "update", "install", "software", "hardware", "server"],
};

export function suggestTagsFromContent(content: string): string[] {
  const contentLower = content.toLowerCase();
  const suggestions: string[] = [];
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      suggestions.push(tag);
    }
  }
  return suggestions;
} 