// src/pages/admin/reportes/components/BotonesExportar.tsx
import {
  ArrowDownTrayIcon,
  CodeBracketSquareIcon,
  DocumentTextIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { exportToCSV, exportToJSON, exportToPDF, printReport } from '../services/admin.reportes.export.service';

interface BotonesExportarProps {
  data: any;
  exportData?: any[];
  nombreReporte: string;
  printElementId?: string;
  isLoading?: boolean;
}

export const BotonesExportar = ({
  data,
  exportData,
  nombreReporte,
  printElementId,
  isLoading,
}: BotonesExportarProps) => {
  const hasData = Boolean(data);
  const canExportRows = Array.isArray(exportData || data?.export_data) && (exportData || data?.export_data).length > 0;
  const disabled = isLoading || !hasData;

  const handleExportCSV = () => {
    const dataToExport = exportData || data?.export_data;
    if (Array.isArray(dataToExport) && dataToExport.length > 0) {
      exportToCSV(dataToExport, nombreReporte);
    } else {
      console.warn('No hay datos para exportar');
    }
  };

  const handleExportJSON = () => {
    if (data) {
      exportToJSON(data, nombreReporte);
    } else {
      console.warn('No hay datos para exportar');
    }
  };

  const handleExportPDF = () => {
    if (printElementId) {
      exportToPDF(printElementId, nombreReporte);
    }
  };

  const handlePrint = () => {
    if (printElementId) {
      printReport(printElementId, nombreReporte);
    }
  };

  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <button
        onClick={handleExportCSV}
        disabled={isLoading || !canExportRows}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Exportar datos tabulares a CSV"
      >
        <ArrowDownTrayIcon className="h-4 w-4 shrink-0" />
        CSV
      </button>
      <button
        onClick={handleExportJSON}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-3 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        title="Exportar reporte completo a JSON"
      >
        <CodeBracketSquareIcon className="h-4 w-4 shrink-0" />
        JSON
      </button>
      {printElementId && (
        <>
          <button
            onClick={handleExportPDF}
            disabled={disabled}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            title="Abrir dialogo para guardar como PDF"
          >
            <DocumentTextIcon className="h-4 w-4 shrink-0" />
            PDF
          </button>
          <button
            onClick={handlePrint}
            disabled={disabled}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="Imprimir reporte"
          >
            <PrinterIcon className="h-4 w-4 shrink-0" />
            Imprimir
          </button>
        </>
      )}
    </div>
  );
};
