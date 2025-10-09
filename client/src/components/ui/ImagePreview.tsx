import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './dialog';
import { Button } from './button';
import { Download, X } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
  title?: string;
  subtitle?: string;
}

export const ImagePreview = ({
  src,
  alt,
  isOpen,
  onClose,
  onDownload,
  title,
  subtitle,
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      window.open(src, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-background/95 backdrop-blur-sm border-border">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            {title && <h3 className="font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative p-4">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className="w-full h-auto rounded-lg shadow-2xl max-h-[80vh] object-contain"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
