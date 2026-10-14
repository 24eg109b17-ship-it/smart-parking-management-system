export const money = amount => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(amount || 0));

export const dateTime = value => value ? new Date(value).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}) : '—';

export function estimateFee(seconds, hourlyRate) {
  return Math.max(1, Math.ceil(Math.max(0, seconds) / 3600)) * Number(hourlyRate || 0);
}

export function downloadCsv(filename, headings, rows) {
  const protect = value => {
    const text = String(value ?? '');
    const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const csv = [headings, ...rows].map(row => row.map(protect).join(',')).join('\r\n');
  const href = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(href);
}
