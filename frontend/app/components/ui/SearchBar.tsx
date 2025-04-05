import React from 'react';
import clsx from 'clsx';

type SearchBarProps = {
  className?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  value?: string;
};

export default function SearchBar({
  className,
  placeholder = 'Search',
  onChange,
  onSearch,
  value,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(e.currentTarget.value);
    }
  };

  return (
    <div className={clsx('relative', className)}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        className="py-2 pl-10 pr-4 bg-[#f5f5f5] border-none rounded-full w-full focus:outline-none focus:ring-2 focus:ring-[--primary-color-light] text-sm"
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        value={value}
      />
    </div>
  );
}
