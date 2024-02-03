export function getCompletionTimestamp(date: string, leadTime: number) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + leadTime);
  return d.toISOString();
}
