import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }
  
  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  // Less than 1 week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }
  
  // Older than 1 week, show date
  return date.toLocaleDateString();
};

export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '??';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateGradient = (seed: string): string => {
  if (!seed || typeof seed !== 'string') {
    return 'linear-gradient(135deg, hsl(200, 70%, 60%) 0%, hsl(260, 70%, 50%) 100%)';
  }
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue1 = hash % 360;
  const hue2 = (hash + 60) % 360;
  
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 60%) 0%, hsl(${hue2}, 70%, 50%) 100%)`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const compressText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const extension = fileName.toLowerCase().split('.').pop();
  return extension ? imageExtensions.includes(`.${extension}`) : false;
};

export const isVideoFile = (fileName: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
  const extension = fileName.toLowerCase().split('.').pop();
  return extension ? videoExtensions.includes(`.${extension}`) : false;
};

export const getFileIcon = (fileName: string): string => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'fas fa-file-pdf';
    case 'doc':
    case 'docx':
      return 'fas fa-file-word';
    case 'xls':
    case 'xlsx':
      return 'fas fa-file-excel';
    case 'ppt':
    case 'pptx':
      return 'fas fa-file-powerpoint';
    case 'txt':
      return 'fas fa-file-alt';
    case 'zip':
    case 'rar':
    case '7z':
      return 'fas fa-file-archive';
    case 'mp3':
    case 'wav':
    case 'ogg':
      return 'fas fa-file-audio';
    case 'mp4':
    case 'webm':
    case 'mov':
      return 'fas fa-file-video';
    default:
      return 'fas fa-file';
  }
};
