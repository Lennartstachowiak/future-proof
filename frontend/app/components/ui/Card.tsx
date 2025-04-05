import React, { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
  gradient?: 'pink-orange' | 'blue-cyan' | 'none';
  onClick?: () => void;
  noPadding?: boolean;
};

export default function Card({
  children,
  className,
  gradient = 'none',
  onClick,
  noPadding = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl shadow-sm',
        gradient === 'pink-orange' && 'gradient-card-pink text-white',
        gradient === 'blue-cyan' && 'gradient-card-blue text-white',
        gradient === 'none' && 'bg-[--card-background]',
        !noPadding && 'p-5',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
