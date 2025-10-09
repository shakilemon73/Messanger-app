import { useRef } from 'react';
import { Button } from './button';
import { useToast } from '@/hooks/use-toast';
import { isSupportedFileType, formatFileSize } from '@/lib/storage';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  accept?: string;
}

export const FileUpload = ({
  onFilesSelect,
  selectedFiles,
  onRemoveFile,
  maxFiles = 5,
  accept = "image/*,video/*,.pdf,.doc,.docx,.txt",
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = ''; // Reset input
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!isSupportedFileType(file)) {
        toast({
          title: 'Unsupported file type',
          description: `${file.name} is not supported`,
          variant: 'destructive',
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: 'File too large',
          description: `${file.name} exceeds 10MB limit`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    onFilesSelect(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Drop files here or click to browse</p>
        <p className="text-sm text-muted-foreground">
          Supports images, videos, documents up to 10MB each
        </p>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({selectedFiles.length}/{maxFiles})</p>
          {selectedFiles.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-card rounded-lg border"
            >
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-file text-primary text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(index);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
