'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface ExportData {
  filename: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

export function useExport() {
  const exportToCSV = (exportData: ExportData) => {
    if (!exportData.data || exportData.data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(exportData.data[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle nested objects and arrays
            if (typeof value === 'object') {
              return `"${JSON.stringify(value)}"`;
            }
            // Quote strings that contain commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value || '';
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${exportData.filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (exportData: ExportData) => {
    const jsonContent = JSON.stringify(exportData.data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${exportData.filename}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV, exportToJSON };
}

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function ExportButton({ data, filename, variant = 'outline' }: ExportButtonProps) {
  const { exportToCSV, exportToJSON } = useExport();

  return (
    <div className="flex gap-2">
      <Button
        variant={variant}
        size="sm"
        onClick={() => exportToCSV({ filename, data })}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button
        variant={variant}
        size="sm"
        onClick={() => exportToJSON({ filename, data })}
        className="gap-2"
      >
        <FileText className="h-4 w-4" />
        JSON
      </Button>
    </div>
  );
}
