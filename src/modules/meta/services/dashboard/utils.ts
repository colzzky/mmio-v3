export function subtractDays(date: Date, days: number) {
  const newDate = new Date(date)

  newDate.setDate(newDate.getDate() - days)

  return newDate
}

export const dateTimeFormat = Intl.DateTimeFormat('en-PH', {
  month: 'long',
  day: 'numeric',
})
