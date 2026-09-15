"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, BottomNav } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Página pública da proposta (aba Link) não tem navegação interna — o
  // cliente que abre o link não deve ver o menu do app.
  if (pathname.startsWith("/proposta")) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <SidebarProvider className="min-h-screen bg-slate-50">
      <AppSidebar />
      <SidebarInset className="bg-slate-50 pb-16 md:pb-0">{children}</SidebarInset>
      <BottomNav />
    </SidebarProvider>
  );
}
