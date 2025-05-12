// Map application timezone codes to IANA timezone strings
const timezoneMap = {
  utc: 'UTC',
  est: 'America/New_York',
  pst: 'America/Los_Angeles',
};

type AppTimezone = 'utc' | 'est' | 'pst';

/**
 * Get the currently selected timezone from localStorage
 */
export function getCurrentTimezone(): string {
  try {
    const prefs = localStorage.getItem('accountPreferences');
    if (prefs) {
      const { timezone } = JSON.parse(prefs);
      return timezoneMap[timezone as AppTimezone] || 'UTC';
    }
  } catch (error) {
    console.error('Error retrieving timezone preference:', error);
  }
  
  return 'UTC'; // Default fallback
}

/**
 * Format a date string according to the user's timezone preference
 */
export function formatDate(dateString: string, formatStyle: 'full' | 'long' | 'medium' | 'short' = 'long'): string {
  try {
    const date = new Date(dateString);
    const timezone = getCurrentTimezone();
    return new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      dateStyle: formatStyle,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a date with time according to the user's timezone preference
 */
export function formatDateTime(dateString: string, formatStyle: 'full' | 'long' | 'medium' | 'short' = 'long'): string {
  try {
    const date = new Date(dateString);
    const timezone = getCurrentTimezone();
    return new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      dateStyle: formatStyle,
      timeStyle: formatStyle,
    }).format(date);
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
}

/**
 * Convert a date to the user's timezone
 */
export function convertToUserTimezone(date: Date): Date {
  try {
    const timezone = getCurrentTimezone();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const dateObj: Record<string, string> = {};
    
    parts.forEach(part => {
      if (part.type !== 'literal') {
        dateObj[part.type] = part.value;
      }
    });
    
    const year = parseInt(dateObj.year);
    const month = parseInt(dateObj.month) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateObj.day);
    const hour = parseInt(dateObj.hour);
    const minute = parseInt(dateObj.minute);
    const second = parseInt(dateObj.second);
    
    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.error('Error converting to user timezone:', error);
    return date;
  }
}

/**
 * Get timezone offset string (e.g., "UTC-5" for EST)
 */
export function getTimezoneOffsetString(): string {
  try {
    const timezone = getCurrentTimezone();
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    return timeZonePart?.value || 'UTC';
  } catch (error) {
    console.error('Error getting timezone offset string:', error);
    return 'UTC';
  }
}

/**
 * Get readable timezone name
 */
export function getReadableTimezone(): string {
  try {
    const prefs = localStorage.getItem('accountPreferences');
    if (prefs) {
      const { timezone } = JSON.parse(prefs);
      switch (timezone) {
        case 'utc':
          return 'Coordinated Universal Time (UTC)';
        case 'est':
          return 'Eastern Standard Time (EST)';
        case 'pst':
          return 'Pacific Standard Time (PST)';
        default:
          return 'Coordinated Universal Time (UTC)';
      }
    }
  } catch (error) {
    console.error('Error getting readable timezone:', error);
  }
  
  return 'Coordinated Universal Time (UTC)';
} 