import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';
import { isSupportedFileType, formatFileSize } from '@/lib/storage';
import { 
  Paperclip, 
  Send, 
  Smile, 
  X,
  Image,
  FileText
} from 'lucide-react';

export const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, startTyping, sendingMessage, uploadProgress } = useChat();
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [message]);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage && selectedFiles.length === 0) return;

    try {
      // Send text message first if present
      if (trimmedMessage) {
        await sendMessage(trimmedMessage);
      }

      // Send files one by one
      for (const file of selectedFiles) {
        await sendMessage(undefined, file);
      }

      // Clear inputs
      setMessage('');
      setSelectedFiles([]);
    } catch (error) {
      // Error handled in useChat hook
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const handleTyping = () => {
    startTyping();
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      {/* File Upload Progress */}
      {sendingMessage && uploadProgress > 0 && (
        <div className="mb-3">
          <div className="glass-card rounded-lg p-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading files...</p>
                <p className="text-xs text-muted-foreground">{uploadProgress.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        </div>
      )}

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-cloud-upload-alt text-6xl text-primary mb-4" />
            <p className="text-xl font-semibold">Drop files here to send</p>
            <p className="text-sm text-muted-foreground mt-2">
              Images, videos, and documents up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-3 space-y-2">
          {selectedFiles.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-2 bg-background rounded-lg border"
              data-testid={`selected-file-${index}`}
            >
              <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <Image className="w-4 h-4 text-primary" />
                ) : (
                  <FileText className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                data-testid={`button-remove-file-${index}`}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div 
        className="flex items-end gap-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0"
          data-testid="button-attach-file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          data-testid="button-emoji"
        >
          <Smile className="w-4 h-4" />
        </Button>

        <div className="flex-1 bg-background border border-input rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-ring transition-all">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            className="min-h-0 max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            rows={1}
            data-testid="textarea-message"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && selectedFiles.length === 0) || sendingMessage}
          className="flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
          data-testid="button-send"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file"
      />
    </div>
  );
};
