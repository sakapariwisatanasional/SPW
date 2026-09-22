import React from 'react';
import { cn } from '../../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn("relative inline-block select-none", className)} {...props}>
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-semibold bg-[#E6F0F8] text-[#0066B3] border border-slate-200",
          sizeStyles[size]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === 'sm' ? "w-2 h-2" : "w-2.5 h-2.5",
            status === 'online' && "bg-[#009B4D]",
            status === 'offline' && "bg-slate-400",
            status === 'away' && "bg-[#F7941D]"
          )}
        />
      )}
    </div>
  );
};
