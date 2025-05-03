// Time estimation utility for suggesting durations based on task content

const TIME_KEYWORDS: Record<string, string> = {
  meeting: '1 hour',
  call: '30 min',
  email: '15 min',
  report: '2 hours',
  workout: '1 hour',
  gym: '1 hour',
  run: '30 min',
  groceries: '45 min',
  shopping: '1.5 hours',
  study: '2 hours',
  read: '30 min',
  clean: '1 hour',
  laundry: '1 hour',
  cook: '1 hour',
  code: '2 hours',
  bug: '1 hour',
  deploy: '30 min',
  review: '45 min',
  homework: '1 hour',
  assignment: '2 hours',
};

export function estimateTimeFromContent(content: string): string {
  const contentLower = content.toLowerCase();
  for (const [keyword, estimate] of Object.entries(TIME_KEYWORDS)) {
    if (contentLower.includes(keyword)) {
      return estimate;
    }
  }
  return '30 min'; // Default estimate
} 