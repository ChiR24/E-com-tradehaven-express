import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'destructive';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary-100 text-primary-800 border-transparent',
  secondary: 'bg-gray-100 text-gray-800 border-transparent',
  success: 'bg-success-100 text-success-800 border-transparent',
  warning: 'bg-warning-100 text-warning-800 border-transparent',
  error: 'bg-error-100 text-error-800 border-transparent',
  info: 'bg-primary-100 text-primary-800 border-transparent',
  outline: 'bg-transparent border-gray-200 text-gray-900',
  destructive: 'bg-error-100 text-error-800 border-transparent',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-primary-500',
  secondary: 'bg-gray-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-primary-500',
  outline: 'bg-gray-400',
  destructive: 'bg-error-500',
};

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <div
          className={cn('mr-1 h-1.5 w-1.5 rounded-full', dotColors[variant])}
        />
      )}
      {children}
    </div>
  );
}
