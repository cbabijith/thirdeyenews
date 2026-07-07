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

export function formatMalayalamDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()} ${malayalamMonths[d.getMonth()]} ${d.getDate()}`
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${englishShortMonths[d.getMonth()]} ${d.getDate()}`
}

export function formatLongDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${englishLongMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${ampm}`
}

export function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'ഇപ്പോൾ'
  if (hours < 24) return `${hours} മണിക്കൂർ മുൻപ്`
  const days = Math.floor(hours / 24)
  return `${days} ദിവസം മുൻപ്`
}
