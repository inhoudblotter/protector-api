export function getFormatDate(date: Date) {
  return `${date.getMonth().toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
}
