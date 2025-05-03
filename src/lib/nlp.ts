import { format, parse, isValid } from 'date-fns';

export interface ParsedTask {
  title: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

const PRIORITY_KEYWORDS = {
  high: ['urgent', 'asap', 'important', 'critical', 'high'],
  medium: ['normal', 'regular', 'medium'],
  low: ['low', 'whenever', 'sometime']
};

const CATEGORY_KEYWORDS = {
  work: ['work', 'job', 'office', 'business'],
  personal: ['personal', 'home', 'life'],
  health: ['health', 'fitness', 'exercise', 'gym'],
  shopping: ['shopping', 'buy', 'purchase'],
  study: ['study', 'learn', 'read', 'research']
};

/**
 * Extracts a date from text using common date formats
 */
function extractDate(text: string): string | undefined {
  const datePatterns = [
    // Today/tomorrow patterns
    /(today|tomorrow)/i,
    // MM/DD/YYYY or DD/MM/YYYY
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/,
    // Month DD, YYYY
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i,
    // Next week/month
    /next\s+(week|month)/i,
    // In X days/weeks/months
    /in\s+(\d+)\s+(day|week|month)s?\b/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const today = new Date();
      let date: Date | undefined;

      switch (match[0].toLowerCase()) {
        case 'today':
          date = today;
          break;
        case 'tomorrow':
          date = new Date(today.setDate(today.getDate() + 1));
          break;
        case 'next week':
          date = new Date(today.setDate(today.getDate() + 7));
          break;
        case 'next month':
          date = new Date(today.setMonth(today.getMonth() + 1));
          break;
        default:
          if (match[0].startsWith('in ')) {
            const amount = parseInt(match[1]);
            const unit = match[2];
            const newDate = new Date(today);
            
            switch (unit) {
              case 'day':
                newDate.setDate(today.getDate() + amount);
                break;
              case 'week':
                newDate.setDate(today.getDate() + (amount * 7));
                break;
              case 'month':
                newDate.setMonth(today.getMonth() + amount);
                break;
            }
            date = newDate;
          } else {
            // Try parsing the date
            const parsedDate = parse(match[0], 'MM/dd/yyyy', new Date());
            if (isValid(parsedDate)) {
              date = parsedDate;
            }
          }
      }

      if (date && isValid(date)) {
        return format(date, 'yyyy-MM-dd');
      }
    }
  }

  return undefined;
}

/**
 * Extracts priority from text based on keywords
 */
function extractPriority(text: string): 'low' | 'medium' | 'high' | undefined {
  const textLower = text.toLowerCase();
  
  for (const [priority, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return priority as 'low' | 'medium' | 'high';
    }
  }
  
  return undefined;
}

/**
 * Extracts category from text based on keywords
 */
function extractCategory(text: string): string | undefined {
  const textLower = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => textLower.includes(keyword))) {
      return category;
    }
  }
  
  return undefined;
}

/**
 * Parses task information from natural language text
 */
export function parseTaskFromText(text: string): ParsedTask {
  const dueDate = extractDate(text);
  const priority = extractPriority(text);
  const category = extractCategory(text);
  
  // Remove date, priority, and category keywords to get the title
  let title = text;
  
  if (dueDate) {
    title = title.replace(/\b(today|tomorrow|next\s+(week|month)|in\s+\d+\s+(day|week|month)s?)\b/gi, '').trim();
  }
  
  if (priority) {
    const priorityKeywords = PRIORITY_KEYWORDS[priority].join('|');
    title = title.replace(new RegExp(`\\b(${priorityKeywords})\\b`, 'gi'), '').trim();
  }
  
  if (category) {
    const categoryKeywords = CATEGORY_KEYWORDS[category as keyof typeof CATEGORY_KEYWORDS].join('|');
    title = title.replace(new RegExp(`\\b(${categoryKeywords})\\b`, 'gi'), '').trim();
  }
  
  return {
    title: title,
    dueDate,
    priority,
    category
  };
} 