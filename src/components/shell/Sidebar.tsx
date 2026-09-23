"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlaneTakeoff,
  Receipt,
  Settings,
  TicketCheck,
  CalendarCheck,
  UserCog,
  Users,
} from "lucide-react";
import { ComponentType } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** também ativa este item quando a rota atual começa com este prefixo */
  matchPrefix?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cotacoes", label: "Cotações", icon: Receipt, matchPrefix: "/cotacoes" },
  { href: "/reservas", label: "Reservas", icon: TicketCheck, matchPrefix: "/reservas" },
  { href: "/checkin", label: "Check-in", icon: CalendarCheck, matchPrefix: "/checkin" },
  { href: "/clientes", label: "Clientes", icon: Users, matchPrefix: "/clientes" },
  { href: "/equipe", label: "Equipe", icon: UserCog, matchPrefix: "/equipe" },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const isActive = (pathname: string, item: NavItem): boolean => {
  if (item.matchPrefix) return pathname === item.href || pathname.startsWith(item.matchPrefix);
  return pathname === item.href;
};

/** Sidebar retrátil (shadcn/ui) — colapsa pra uma barra só de ícones em
 * telas médias/grandes (ver botão em PageHeader). No mobile continua
 * usando o BottomNav abaixo, não o modo "sheet" do shadcn. */
export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-slate-200">
      <SidebarHeader className="border-b border-slate-200 p-2">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link href="/" className="flex min-w-0 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 shadow-xs">
              <PlaneTakeoff className="h-4 w-4 text-white" />
            </div>
            <span className="truncate text-sm font-bold text-slate-900">
              Cotation
            </span>
          </Link>
          <SidebarTrigger
            title="Recolher / Expandir menu"
            className="shrink-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      className={
                        active
                          ? "bg-teal-50 text-teal-700 hover:bg-teal-50 hover:text-teal-700"
                          : "text-slate-600"
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 p-2">
        <div className="flex items-center group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger
            title="Recolher / Expandir menu"
            className="w-full justify-start gap-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition group-data-[collapsible=icon]:justify-center"
          />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              active ? "text-teal-700" : "text-slate-500"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
