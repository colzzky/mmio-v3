import type { Timestamp } from '../types/UniTypes'

export const uiHelpers = {
  formatDateTimeAgo(dateString: string, locale: string = 'en-US'): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const timeIntervals: { [key: string]: number } = {
      year: 60 * 60 * 24 * 365,
      month: 60 * 60 * 24 * 30,
      week: 60 * 60 * 24 * 7,
      day: 60 * 60 * 24,
      hour: 60 * 60,
      minute: 60,
      second: 1,
    }

    for (const [unit, secondsInUnit] of Object.entries(timeIntervals)) {
      const diff = Math.floor(diffInSeconds / secondsInUnit)

      if (diff >= 1) {
        const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
        return formatter.format(-diff, unit as Intl.RelativeTimeFormatUnit)
      }
    }

    return 'just now'
  },

  toTitleCase(str: string): string {
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  },

  timestampToDateTimeAgo(timestamp: Timestamp): string {
    // Convert seconds and nanoseconds to milliseconds
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    const now = new Date()

    // Calculate the difference in seconds
    const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000)

    // Determine the appropriate time ago format
    let interval: number
    let unit: string

    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`
    } else if (secondsAgo < 3600) {
      interval = Math.floor(secondsAgo / 60)
      unit = interval === 1 ? 'minute' : 'minutes'
      return `${interval} ${unit} ago`
    } else if (secondsAgo < 86400) {
      interval = Math.floor(secondsAgo / 3600)
      unit = interval === 1 ? 'hour' : 'hours'
      return `${interval} ${unit} ago`
    } else if (secondsAgo < 2592000) {
      interval = Math.floor(secondsAgo / 86400)
      unit = interval === 1 ? 'day' : 'days'
      return `${interval} ${unit} ago`
    } else if (secondsAgo < 31536000) {
      interval = Math.floor(secondsAgo / 2592000)
      unit = interval === 1 ? 'month' : 'months'
      return `${interval} ${unit} ago`
    } else {
      interval = Math.floor(secondsAgo / 31536000)
      unit = interval === 1 ? 'year' : 'years'
      return `${interval} ${unit} ago`
    }
  },
}
