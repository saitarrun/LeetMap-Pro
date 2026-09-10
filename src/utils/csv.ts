function escapeCsvCell(value: string | number): string {
  const rawValue = String(value);
  const safeValue = /^[=+\-@\t\r]/.test(rawValue) ? `'${rawValue}` : rawValue;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>
): void {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');
  const blobUrl = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename.replace(/[^a-z0-9._-]/gi, '_');
  link.click();
  URL.revokeObjectURL(blobUrl);
}
