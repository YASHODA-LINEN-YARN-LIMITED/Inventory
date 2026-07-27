import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Download, HelpCircle } from 'lucide-react';

interface CSVUploaderProps {
  onUpload: (data: any[]) => void;
  className?: string;
  label?: string;
  sampleTemplate?: {
    filename: string;
    headers: string[];
    sampleRows: string[][];
  };
}

/**
 * Case-insensitive, space-insensitive helper to look up values from a CSV row
 */
export function getRowValue(row: Record<string, any>, possibleKeys: string[], defaultValue = ''): string {
  if (!row) return defaultValue;
  
  // Normalize row keys
  const normalizedRow: Record<string, any> = {};
  for (const k of Object.keys(row)) {
    if (!k) continue;
    const cleanKey = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    normalizedRow[cleanKey] = row[k];
  }
  
  for (const pKey of possibleKeys) {
    const cleanPKey = pKey.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedRow[cleanPKey] !== undefined && normalizedRow[cleanPKey] !== null) {
      const val = String(normalizedRow[cleanPKey]).trim();
      if (val !== '') return val;
    }
  }
  
  return defaultValue;
}

export function CSVUploader({ onUpload, className = '', label = "Upload CSV", sampleTemplate }: CSVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          alert('Uploaded CSV file is empty or contains no valid rows.');
          return;
        }
        onUpload(results.data);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Failed to parse CSV file: ' + error.message);
      }
    });
  };

  const handleDownloadSample = () => {
    if (!sampleTemplate) return;
    const csvContent = [
      sampleTemplate.headers.join(','),
      ...sampleTemplate.sampleRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', sampleTemplate.filename || 'sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="file"
        accept=".csv,.txt"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-3.5 py-2 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 transition-colors text-sm font-semibold bg-white dark:bg-zinc-900 shadow-2xs"
      >
        <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        {label}
      </button>

      {sampleTemplate && (
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 transition-colors text-xs font-medium bg-white dark:bg-zinc-900"
          title="Download Sample CSV Format Template"
        >
          <Download className="w-3.5 h-3.5 text-gray-500" />
          <span>Sample Template</span>
        </button>
      )}
    </div>
  );
}

