"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, BottomNav } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-screen bg-slate-50">
      <AppSidebar />
      <SidebarInset className="bg-slate-50 pb-16 md:pb-0">{children}</SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
