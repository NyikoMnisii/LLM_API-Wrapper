const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function dayLabel(isoDate: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return DAY_LABELS[date.getDay()];
}

export function formatFullDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}

export function formatTime(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
