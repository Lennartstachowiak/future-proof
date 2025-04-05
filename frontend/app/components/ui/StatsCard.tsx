import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Card from './Card';

type StatsCardProps = {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  gradient?: 'pink-orange' | 'blue-cyan' | 'none';
  className?: string;
  onClick?: () => void;
};

export default function StatsCard({
  title,
  value,
  subtext,
  icon,
  gradient = 'none',
  className,
  onClick,
}: StatsCardProps) {
  return (
    <Card
      gradient={gradient}
      className={clsx('h-full', className)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-sm font-[500] opacity-80">{title}</div>
        {icon && <div className="opacity-75">{icon}</div>}
      </div>
      
      <div className="dashboard-stat mt-2 mb-1">{value}</div>
      
      {subtext && (
        <div className="text-xs opacity-75">{subtext}</div>
      )}
    </Card>
  );
}
