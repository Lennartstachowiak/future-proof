import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Forecast',
      href: '/forecast',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Promotion',
      href: '/promotion',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      name: 'Inventory',
      href: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[--card-background] fixed inset-y-0 left-0 z-10 w-64 border-r border-neutral-200 flex flex-col">
      {/* Logo and app name */}
      <div className="p-5 flex items-center">
        <div className="bg-[--primary-color] h-10 w-10 flex items-center justify-center rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h1 className="ml-3 text-lg font-semibold">RestaurantPredict</h1>
      </div>

      {/* User profile summary */}
      <div className="p-5">
        <div className="bg-[--background-light] rounded-xl p-4">
          <div className="flex items-center">
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[#f5f5f5] border border-[#e5e5e5]">
              <svg className="absolute inset-0 h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="font-[500]">Chef Antonio</h2>
              <p className="text-sm text-[--foreground-secondary]">Head Chef</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm font-[500] transition-colors',
                pathname === item.href
                  ? 'bg-[--primary-light] text-[--primary-color]'
                  : 'text-[--foreground-secondary] hover:bg-[#f5f5f5]'
              )}
            >
              <span className="mr-3 opacity-75">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer with version or status */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center justify-center text-xs text-[--foreground-secondary]">
          <span className="flex h-2 w-2 relative mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          System online
        </div>
      </div>
    </div>
  );
}
