import { cn, getInitials, generateGradient } from '@/lib/utils';

interface AvatarProps {
  name?: string | null;
  src?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar = ({ name, src, className, size = 'md' }: AvatarProps) => {
  const displayName = name || 'Unknown';
  const initials = getInitials(displayName);
  const gradient = generateGradient(displayName);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
          className
        )}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${cn(
                'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
                sizeClasses[size],
                className
              )}" style="background: ${gradient}">
                ${initials}
              </div>
            `;
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0',
        sizeClasses[size],
        className
      )}
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
};
