'use client';

import * as React from 'react';
import Image from 'next/image';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Upload, X, File, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { FormField } from './FormField';

interface FileUploadProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  error?: string;
}

const FileUpload = ({
  name,
  label,
  description,
  required,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  multiple = true,
  className,
}: FileUploadProps) => {
  const [files, setFiles] = React.useState<FileWithPreview[]>([]);
  const { register, setValue } = useFormContext();

  React.useEffect(() => {
    register(name);
  }, [register, name]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        })
      );

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
      setFiles(updatedFiles);
      setValue(name, multiple ? updatedFiles : updatedFiles[0] || null, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      // Handle rejected files
      rejectedFiles.forEach(({ file, errors }) => {
        console.error('File rejected:', file.name, errors);
      });
    },
    [files, multiple, setValue, name]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    multiple,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setValue(name, multiple ? newFiles : newFiles[0] || null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.includes('pdf')) return FileText;
    return File;
  };

  return (
    <FormField name={name} label={label} description={description} required={required}>
      <div className={cn('space-y-4', className)}>
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            'cursor-pointer rounded-[28px] border-2 border-dashed p-6 transition-colors',
            isDragActive && !isDragReject && 'border-primary-500 bg-primary-50',
            isDragReject && 'border-error-500 bg-error-50',
            !isDragActive && 'border-white/70 bg-card/70 hover:border-primary-300 dark:border-charcoal-600'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-charcoal-400" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? isDragReject
                    ? 'File type not accepted'
                    : 'Drop files here'
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                Accepted formats: Images, PDF, DOC, DOCX (Max: {formatFileSize(maxSize)})
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file);
              
              return (
                <div
                  key={`${file.name}-${index}`}
                  className="relative rounded-[24px] border border-white/60 bg-white/80 p-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)]"
                >
                  <div className="flex items-start gap-3">
                    {/* Preview or Icon */}
                    {file.preview ? (
                      <Image
                        src={file.preview}
                        alt={file.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-charcoal-100">
                        <FileIcon className="h-5 w-5 text-charcoal-600" />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-charcoal-500">
                        {formatFileSize(file.size)}
                      </p>
                      
                    </div>

                    {/* Remove Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Error Message */}
                  {file.error && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-error-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>{file.error}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormField>
  );
};

export { FileUpload };
