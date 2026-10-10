import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Store,
  Package,
  Tag,
  ShoppingBag,
  Users,
  Palette,
  BarChart3,
  Settings,
  ShieldCheck,
  Blocks,
  ChevronDown,
  Coins,
  RotateCcw,
  AlertTriangle,
  Bell,
  Store as StoreIcon,
  PackageOpen,
  Wallet,
  Trophy,
  QrCode,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FennecyLogo } from "@/components/ui/fennecy-logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useInstalledApps } from "@/hooks/use-installed-apps";
import { APPS_BY_KEY } from "@/lib/apps";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";

type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  gradient: string;
  external?: boolean;
  tourId?: string;
};

type NavGroup = { label: string; items: NavItem[] };

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const { installed } = useInstalledApps();
  const installedApps = Array.from(installed)
    .map((key) => APPS_BY_KEY[key])
    .filter(Boolean);
  const anyAppActive = pathname.startsWith("/dashboard/apps/");
  const [appsOpen, setAppsOpen] = useState(anyAppActive);
  useEffect(() => {
    if (anyAppActive) setAppsOpen(true);
  }, [anyAppActive]);

  const [purpleSidebar, setPurpleSidebar] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("sidebar-purple");
    } catch (error) {
      console.warn(error);
    }
    const enabled = stored === "true";
    setPurpleSidebar(enabled);
    document.documentElement.setAttribute("data-sidebar-purple", String(enabled));
  }, []);

  const togglePurple = (checked: boolean) => {
    setPurpleSidebar(checked);
    document.documentElement.setAttribute("data-sidebar-purple", String(checked));
    try {
      localStorage.setItem("sidebar-purple", String(checked));
    } catch (error) {
      console.warn(error);
    }
  };

  const groups: NavGroup[] = [
    {
      label: "Workspace",
      items: [
        {
          title: t("dashboard.nav.dashboard"),
          url: "/dashboard",
          icon: LayoutDashboard,
          end: true,
          gradient: "from-violet-500 to-fuchsia-500",
          tourId: "dashboard",
        },
        {
          title: t("dashboard.nav.store"),
          url: "/dashboard/store",
          icon: Store,
          gradient: "from-indigo-500 to-blue-500",
        },
        {
          title: "Notifications",
          url: "/dashboard/notifications",
          icon: Bell,
          gradient: "from-violet-500 to-indigo-500",
        },
        {
          title: t("dashboard.nav.customize"),
          url: "/customize",
          icon: Palette,
          external: true,
          gradient: "from-teal-500 to-emerald-500",
          tourId: "customize",
        },
        {
          title: t("dashboard.qr.nav"),
          url: "/dashboard/qr-code",
          icon: QrCode,
          gradient: "from-fuchsia-500 to-purple-500",
        },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          title: t("dashboard.nav.products"),
          url: "/dashboard/products",
          icon: Package,
          gradient: "from-emerald-500 to-teal-500",
          tourId: "products",
        },
        {
          title: t("dashboard.nav.categories"),
          url: "/dashboard/categories",
          icon: Tag,
          gradient: "from-amber-500 to-orange-500",
        },
        {
          title: t("dashboard.nav.marketplace", { defaultValue: "سوق التوريد" }),
          url: "/dashboard/marketplace",
          icon: PackageOpen,
          gradient: "from-orange-500 to-rose-500",
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          title: t("dashboard.nav.orders"),
          url: "/dashboard/orders",
          icon: ShoppingBag,
          gradient: "from-pink-500 to-rose-500",
          tourId: "orders",
        },
        {
          title: "Returns & Refunds",
          url: "/dashboard/returns",
          icon: RotateCcw,
          gradient: "from-rose-500 to-pink-500",
        },
        {
          title: "Stock Alerts",
          url: "/dashboard/stock-alerts",
          icon: AlertTriangle,
          gradient: "from-amber-500 to-red-500",
        },
        {
          title: "Shipments",
          url: "/dashboard/shipments",
          icon: Package,
          gradient: "from-sky-500 to-indigo-500",
        },
        {
          title: t("dashboard.nav.customers"),
          url: "/dashboard/customers",
          icon: Users,
          gradient: "from-sky-500 to-cyan-500",
        },
        {
          title: t("dashboard.nav.analytics"),
          url: "/dashboard/analytics",
          icon: BarChart3,
          gradient: "from-orange-500 to-red-500",
        },
        {
          title: t("dashboard.nav.profit"),
          url: "/dashboard/profit",
          icon: Wallet,
          gradient: "from-emerald-500 to-teal-500",
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          title: t("dashboard.nav.appStore"),
          url: "/dashboard/apps",
          icon: Blocks,
          gradient: "from-violet-500 to-purple-500",
        },
        {
          title: t("dashboard.nav.progress", "Progress"),
          url: "/dashboard/progress",
          icon: Trophy,
          gradient: "from-purple-500 to-pink-500",
        },
        {
          title: t("dashboard.nav.credits"),
          url: "/dashboard/credits",
          icon: Coins,
          gradient: "from-yellow-500 to-amber-500",
        },
        {
          title: "Store Settings",
          url: "/dashboard/store-settings",
          icon: StoreIcon,
          gradient: "from-emerald-500 to-teal-600",
        },
        {
          title: t("dashboard.nav.settings"),
          url: "/dashboard/settings",
          icon: Settings,
          gradient: "from-zinc-500 to-slate-600",
        },
      ],
    },
  ];

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const isActive = (url: string, end?: boolean) =>
    end ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  const renderIcon = (Icon: typeof LayoutDashboard, gradient: string, active: boolean) => (
    <span
      className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white transition-all duration-200 ${
        active
          ? "scale-110 ring-2 ring-white/15"
          : "opacity-80 group-hover/menu-item:opacity-100 group-hover/menu-item:scale-105 group-hover/menu-item:shadow-md"
      }`}
    >
      <Icon className="h-4 w-4 drop-shadow-sm" />
    </span>
  );

  const renderMenuItem = (item: NavItem) => {
    const active = !item.external && isActive(item.url, item.end);
    const linkClass = `group/menu-item relative rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
      active
        ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
        : "hover:bg-sidebar-accent/50 hover:shadow-sm"
    }`;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={active} tooltip={item.title} className="h-10">
          {item.external ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              data-tour={item.tourId}
            >
              {renderIcon(item.icon, item.gradient, active)}
              <span className="text-[13px]">{item.title}</span>
            </a>
          ) : (
            <Link to={item.url} className={linkClass} data-tour={item.tourId} data-sound="click">
              {active && (
                <span
                  className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b ${item.gradient}`}
                />
              )}
              {renderIcon(item.icon, item.gradient, active)}
              <span className="text-[13px]">{item.title}</span>
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border"
    >
      <SidebarHeader className="bg-transparent">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2.5 group">
          <FennecyLogo
            className={cn(
              "h-10 w-10 shrink-0 transition-transform group-hover:scale-105 sidebar-purple:bg-white",
              collapsed ? "" : "h-10 w-40",
            )}
            ariaLabel="Fennecly"
          />
        </Link>
        {!collapsed && (
          <div className="flex items-center justify-between px-2 py-1.5 mt-1 rounded-lg bg-sidebar-accent/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <Palette className="h-3 w-3" />
              </span>
              <span className="text-xs font-medium text-sidebar-foreground/80">Purple sidebar</span>
            </div>
            <Switch checked={purpleSidebar} onCheckedChange={togglePurple} className="h-5 w-9" />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="px-1.5 py-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 px-2 mb-0.5">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">{group.items.map(renderMenuItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {installedApps.length > 0 && (
          <Collapsible open={appsOpen} onOpenChange={setAppsOpen}>
            <SidebarGroup>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel
                  asChild
                  className="cursor-pointer hover:bg-sidebar-accent/40 rounded-md transition-colors text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50"
                >
                  <button className="w-full flex items-center justify-between px-2">
                    <span>{t("dashboard.groupApps")}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${appsOpen ? "" : "-rotate-90"}`}
                    />
                  </button>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {installedApps.map((app) => {
                      const url = `/dashboard/apps/${app.key}`;
                      const active = pathname === url;
                      const Icon = app.icon;
                      const gradient = "from-violet-500 to-fuchsia-500";
                      return (
                        <SidebarMenuItem key={app.key}>
                            <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={app.name}
                            className="h-10"
                          >
                            <Link
                              to={url}
                              className={`group/menu-item relative rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                                active
                                  ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                                  : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                              }`}
                            >
                              {renderIcon(Icon, gradient, active)}
                              <span className="text-[13px]">{app.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/50 px-2 mb-0.5">
              {t("dashboard.groupAdmin")}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/payments")}
                    tooltip={t("dashboard.nav.payments")}
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/payments"
                      className={`group/menu-item relative rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/payments")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        ShieldCheck,
                        "from-red-500 to-orange-500",
                        isActive("/dashboard/admin/payments"),
                      )}
                      <span className="text-[13px]">{t("dashboard.nav.payments")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/marketplace")}
                    tooltip="Marketplace Review"
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/marketplace"
                      className={`group/menu-item relative rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/marketplace")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        ShieldCheck,
                        "from-purple-500 to-pink-500",
                        isActive("/dashboard/admin/marketplace"),
                      )}
                      <span className="text-[13px]">Marketplace Review</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/dropship-orders")}
                    tooltip="Dropship Orders"
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/dropship-orders"
                      className={`group/menu-item relative rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/dropship-orders")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        ShoppingBag,
                        "from-rose-500 to-fuchsia-500",
                        isActive("/dashboard/admin/dropship-orders"),
                      )}
                      <span className="text-[13px]">Dropship Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/wallet-topups")}
                    tooltip="Wallet Top-ups"
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/wallet-topups"
                      className={`group/menu-item relative rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/wallet-topups")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold shadow-sm border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        Wallet,
                        "from-violet-500 to-purple-500",
                        isActive("/dashboard/admin/wallet-topups"),
                      )}
                      <span className="text-[13px]">Wallet Top-ups</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/supply-marketplace")}
                    tooltip={t("dashboard.nav.adminSupplyMarketplace", { defaultValue: "سوق التوريد" })}
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/supply-marketplace"
                      className={`group/menu-item relative rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/supply-marketplace")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        Store,
                        "from-amber-500 to-orange-500",
                        isActive("/dashboard/admin/supply-marketplace"),
                      )}
                      <span className="text-[13px]">{t("dashboard.nav.adminSupplyMarketplace", { defaultValue: "سوق التوريد" })}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard/admin/apps")}
                    tooltip="Built-in Apps"
                    className="h-10"
                  >
                    <Link
                      to="/dashboard/admin/apps"
                      className={`group/menu-item relative rounded-lg transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 ${
                        isActive("/dashboard/admin/apps")
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-sidebar-accent-foreground font-semibold border border-primary/10"
                          : "hover:bg-sidebar-accent/50 hover:shadow-sm"
                      }`}
                    >
                      {renderIcon(
                        Blocks,
                        "from-blue-500 to-cyan-500",
                        isActive("/dashboard/admin/apps"),
                      )}
                      <span className="text-[13px]">Built-in Apps</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
