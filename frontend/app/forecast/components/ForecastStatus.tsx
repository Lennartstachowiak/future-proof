"use client";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";

type LoadingStateProps = {
  title: string;
  subtitle: string;
};

export function LoadingState({ title, subtitle }: LoadingStateProps) {
  return (
    <DashboardLayout title={title} subtitle={subtitle}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--primary-color]"></div>
      </div>
    </DashboardLayout>
  );
}

type ErrorStateProps = {
  error: string;
};

export function ErrorState({ error }: ErrorStateProps) {
  return (
    <DashboardLayout
      title="Error"
      subtitle="There was a problem loading your forecast data"
    >
      <Card className="bg-red-50 border border-red-200">
        <div className="text-red-700">
          <strong className="font-[500]">Error:</strong>
          <span className="ml-2">{error}</span>
        </div>
      </Card>
    </DashboardLayout>
  );
}
