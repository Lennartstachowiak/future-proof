import React from 'react';
import clsx from 'clsx';

type HeaderProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export default function Header({ title = 'Welcome', subtitle, action, className }: HeaderProps) {
  return (
    <header className={clsx('flex items-center justify-between mb-6', className)}>
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-[--foreground-secondary] mt-1">{subtitle}</p>}
      </div>
      
      {action && (
        <div className="flex items-center">
          {action}
        </div>
      )}
    </header>
  );
}
