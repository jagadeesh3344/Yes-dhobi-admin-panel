export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const columnHeaders = headers || Object.keys(rows[0]).map((key) => ({ key: key as keyof T, label: key }));

  const csvRows = [
    columnHeaders.map((header) => `"${String(header.label).replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      columnHeaders
        .map((header) => {
          const val = row[header.key];
          const valString = val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${valString.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ];

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
