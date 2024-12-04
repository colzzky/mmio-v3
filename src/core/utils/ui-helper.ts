import { type TransformedTimezone } from '@/core/types/UniTypes';
import type { Updater } from "@tanstack/vue-table"
import type { Ref } from "vue"

type TransformFunction<T> = (value: T) => any;
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
  computeExpirationDate(timestamp: number) {
    // Convert Unix timestamp to milliseconds
    const expirationDate = new Date(timestamp * 1000)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    }
    return expirationDate.toLocaleString('en-US', options).replace(',', '')

    // Return the expiration date in ISO format
  },

  timestampToDateTimeAgo(timestamp: string): string {
    // Parse the ISO 8601 string to a Date object
    const date = new Date(timestamp)
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
  isTokenExpired(expirationTimestamp: number) {
    // Convert the expiration timestamp to milliseconds
    const expirationTimeInMillis = expirationTimestamp * 1000 // Convert to milliseconds
    const currentTimeInMillis = Date.now() // Get current time in milliseconds

    // Check if the token is expired
    return currentTimeInMillis >= expirationTimeInMillis
  },

  async timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  },

  generateExpirationDate(seconds: number) {
    const date = new Date() // Get the current date and time
    date.setSeconds(date.getSeconds() + seconds) // Add the specified number of seconds
    return date.toISOString() // Convert to ISO string format
  },

  //Create a deep copy of an object and retain function
  deepCopy<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (obj instanceof Date) {
      return new Date(obj) as T
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepCopy(item)) as unknown as T
    }

    const copy: Partial<T> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = this.deepCopy(obj[key])
      }
    }

    return copy as T
  },



  shallowPick<T, K extends keyof T>(
    obj: T,
    keys: K[],
    transforms: Partial<Record<K, (value: T[K]) => any>> = {}
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
  
    keys.forEach((key) => {
      let value = obj[key];
  
      // Apply transformation if a transform function is provided for the key
      if (transforms[key]) {
        value = transforms[key]!(value);
      } else if (Array.isArray(value)) {
        // Create a shallow copy of the array
        value = [...value] as T[K];
      } else if (value && typeof value === "object") {
        // Create a shallow copy of the object
        value = { ...value } as T[K];
      }
  
      result[key] = value;
    });
  
    return result;
  },

  convertTimeToReadableFormat(time: string): string {
    const [hour, minute] = time.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";

    // Convert hour to 12-hour format
    const readableHour = hour % 12 || 12; // Converts 0 to 12 for 12:00 AM
    const readableMinute = minute.toString().padStart(2, "0"); // Ensure two digits for minute

    return `${readableHour}:${readableMinute} ${period}`;
  },

  async timezoneList(): Promise<TransformedTimezone[]> {
    const data = await import('@/assets/timezone_utils.json'); // Dynamically import the JSON
    const timezones = data.default || data; // Use `default` if the data is wrapped in it
  
    // Assuming timezones is an array of objects like { value, abbr, text, offset }
    return timezones.map((timezone: any) => ({
      name: timezone.value,
      abr: timezone.abbr,
      text: timezone.text,
      offset: timezone.offset,
    }));
  },

  formatToCurrency(input: number) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(input)
  },

  formatToPercentage(input: number) {
    return new Intl.NumberFormat('en-PH', {
      style: 'percent',
      currency: 'PHP',
    }).format(input)
  },

  valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
    ref.value = typeof updaterOrValue === 'function'
      ? updaterOrValue(ref.value)
      : updaterOrValue

  }
}