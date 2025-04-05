import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import SearchBar from '../ui/SearchBar';

type DashboardLayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
};

export default function DashboardLayout({
  children,
  title,
  subtitle,
  showSearch = true,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[--background-light] flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 ml-64">
        <div className="p-6">
          <Header 
            title={title} 
            subtitle={subtitle}
            action={showSearch && <SearchBar className="w-64" />}
          />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
