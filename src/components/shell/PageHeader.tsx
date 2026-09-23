import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <header className="border-b border-slate-200 bg-white">
    <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger
          title="Recolher / Expandir menu"
          className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
        />
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
          {description ? <p className="text-xs text-slate-500 mt-0.5">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  </header>
);
