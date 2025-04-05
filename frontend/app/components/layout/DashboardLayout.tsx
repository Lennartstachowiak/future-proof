import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

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
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-[--background-light] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-64">
        <div className="p-6">
          <Header title={title} subtitle={subtitle} />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
