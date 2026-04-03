'use client';

import React from 'react';
import { File, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface FileItem {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove?: (id: string) => void;
  onDownload?: (file: FileItem) => void;
  className?: string;
  showDownload?: boolean;
}

export function FileList({
  files,
  onRemove,
  onDownload,
  className,
  showDownload = true,
}: FileListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-muted rounded-lg"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <File className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {showDownload && onDownload && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDownload(file)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(file.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}