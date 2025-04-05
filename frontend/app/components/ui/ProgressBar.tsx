import React from "react";
import clsx from "clsx";

type ProgressBarProps = {
  value: number;
  max?: number;
  showValue?: boolean;
  color?: "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
};

export default function ProgressBar({
  value,
  max = 100,
  showValue = false,
  color = "primary",
  size = "md",
  className,
  label,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const colorClassMap = {
    primary: "bg-[--primary-color]",
    success: "bg-[--success-color]",
    warning: "bg-[--warning-color]",
    error: "bg-[--error-color]",
    info: "bg-[--info-color]",
  };

  const sizeClassMap = {
    sm: "h-1",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm text-neutral-600">{label}</div>
          {showValue && (
            <div className="text-sm font-[500]">{Math.round(percentage)}%</div>
          )}
        </div>
      )}
      <div className="progress-bar-container">
        <div
          className={clsx(
            "progress-bar",
            colorClassMap[color],
            sizeClassMap[size]
          )}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
