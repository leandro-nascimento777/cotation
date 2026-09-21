import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="hidden text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:inline-flex" />
        <div>
          <h1 className="text-lg font-bold text-slate-900">{title}</h1>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  </header>
);
