export function getRowsCount(table: string) {
  return `SELECT COUNT(*) AS total_count FROM ${table};`;
}
