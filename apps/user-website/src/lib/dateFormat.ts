const malayalamMonths = [
  'ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ',
  'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ഓഗസ്റ്റ്',
  'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ',
]

const englishShortMonths = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const englishLongMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function toIST(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS)
}

export function formatMalayalamDate(dateStr: string): string {
  const d = toIST(new Date(dateStr))
  return `${d.getUTCFullYear()} ${malayalamMonths[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function formatShortDate(dateStr: string): string {
  const d = toIST(new Date(dateStr))
  return `${englishShortMonths[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function formatLongDate(dateStr: string): string {
  const d = toIST(new Date(dateStr))
  return `${englishLongMonths[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

export function formatTime(dateStr: string): string {
  const d = toIST(new Date(dateStr))
  let hours = d.getUTCHours()
  const minutes = d.getUTCMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${ampm}`
}

export function getTimeAgo(dateStr: string): string {
  const now = toIST(new Date())
  const then = toIST(new Date(dateStr))
  const diff = now.getTime() - then.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'ഇപ്പോൾ'
  if (hours < 24) return `${hours} മണിക്കൂർ മുൻപ്`
  const days = Math.floor(hours / 24)
  return `${days} ദിവസം മുൻപ്`
}
