// src/pages/admin/reportes/services/admin.reportes.export.service.ts

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildPrintableDocument = (elementId: string, title: string, mode: 'print' | 'pdf') => {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;
  const safeTitle = escapeHtml(title);

  const appStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('\n');

  const generatedAt = new Date().toLocaleString('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${safeTitle}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${appStyles}
        <style>
          @page { size: A4; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #ffffff;
            color: #111827;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-shell { padding: 24px; }
          .print-header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
            padding-bottom: 16px;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .print-title { margin: 0; font-size: 22px; font-weight: 800; color: #111827; }
          .print-meta { margin: 6px 0 0; font-size: 12px; color: #6b7280; }
          .print-badge {
            border: 1px solid #dbeafe;
            background: #eff6ff;
            color: #1d4ed8;
            border-radius: 999px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }
          svg {
            width: 18px !important;
            height: 18px !important;
            max-width: 18px !important;
            max-height: 18px !important;
            flex: 0 0 auto !important;
          }
          button, .no-print { display: none !important; }
          table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          th, td { border-color: #e5e7eb !important; }
          .shadow, .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          .rounded-lg, .rounded-xl, .rounded-2xl { border-radius: 8px !important; }
          .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
          @media print {
            body { margin: 0; }
            .print-shell { padding: 0; }
          }
        </style>
      </head>
      <body>
        <main class="print-shell">
          <header class="print-header">
            <div>
              <h1 class="print-title">${safeTitle}</h1>
              <p class="print-meta">Generado el ${generatedAt}</p>
            </div>
            <span class="print-badge">${mode === 'pdf' ? 'PDF' : 'Impresion'}</span>
          </header>
          ${printContent.innerHTML}
        </main>
      </body>
    </html>
  `;
};

const openPrintableWindow = (elementId: string, title: string, mode: 'print' | 'pdf') => {
  const html = buildPrintableDocument(elementId, title, mode);
  if (!html) return;

  const originalTitle = document.title;
  document.title = title;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    document.title = originalTitle;
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  const runPrint = () => {
    printWindow.focus();
    printWindow.print();
    document.title = originalTitle;
  };

  printWindow.onload = () => window.setTimeout(runPrint, 250);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item) =>
    headers.map((header) => {
      const value = item[header];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value !== null && value !== undefined ? value : '';
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (elementId: string, title: string) => {
  openPrintableWindow(elementId, title, 'pdf');
};

export const printReport = (elementId: string, title: string) => {
  openPrintableWindow(elementId, title, 'print');
};
