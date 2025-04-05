import React, { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClassMap: Record<BadgeVariant, string> = {
    default: 'bg-[#f5f5f5] text-[#333333]',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-[500]',
        variantClassMap[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
