import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';

interface CSVUploaderProps {
  onUpload: (data: any[]) => void;
  className?: string;
  label?: string;
}

export function CSVUploader({ onUpload, className, label = "Upload CSV" }: CSVUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onUpload(results.data);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Failed to parse CSV file');
      }
    });
  };

  return (
    <div className={className}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900"
      >
        <Upload className="w-4 h-4" />
        {label}
      </button>
    </div>
  );
}
