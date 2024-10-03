export const uiHelpers = {
    formatDateTimeAgo(dateString: string, locale: string = 'en-US'): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
        const timeIntervals: { [key: string]: number } = {
          year: 60 * 60 * 24 * 365,
          month: 60 * 60 * 24 * 30,
          week: 60 * 60 * 24 * 7,
          day: 60 * 60 * 24,
          hour: 60 * 60,
          minute: 60,
          second: 1,
        };
      
        for (const [unit, secondsInUnit] of Object.entries(timeIntervals)) {
          const diff = Math.floor(diffInSeconds / secondsInUnit);
      
          if (diff >= 1) {
            const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
            return formatter.format(-diff, unit as Intl.RelativeTimeFormatUnit);
          }
        }
      
        return 'just now';
      }
}
