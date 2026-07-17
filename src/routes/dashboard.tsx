import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { OnboardingWizard } from "@/components/dashboard/OnboardingWizard";
import { CreditsProvider } from "@/hooks/use-credits";
import { PaywallDialog } from "@/components/dashboard/PaywallDialog";
import { CurrentStoreProvider, useCurrentStore } from "@/hooks/use-current-store";
import { IOSInstallBanner } from "@/components/dashboard/IOSInstallBanner";
import { registerServiceWorker } from "@/lib/pwa/register-sw";
import { playSound } from "@/lib/sounds";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { KeyboardShortcutsGuide, useKeyboardShortcutsGuide } from "@/components/storefront/KeyboardShortcutsGuide";
import { useOrderVoice } from "@/hooks/use-order-voice";

const WelcomeDialog = lazy(() =>
  import("@/components/dashboard/WelcomeDialog").then((m) => ({
    default: m.WelcomeDialog,
  })),
);

const OnboardingTour = lazy(() =>
  import("@/components/dashboard/OnboardingTour").then((m) => ({
    default: m.OnboardingTour,
  })),
);

import { LogoLoader } from "@/components/ui/logo-loader";

const HelpChatbot = lazy(() =>
  import("@/components/dashboard/HelpChatbot").then((m) => ({
    default: m.HelpChatbot,
  })),
);

const AICopilot = lazy(() =>
  import("@/components/dashboard/AICopilot").then((m) => ({
    default: m.AICopilot,
  })),
);

import { LoginPopup } from "@/components/dashboard/LoginPopup";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  head: () => ({
    meta: [
      { title: "Dashboard — Fennecly" },
      {
        name: "description",
        content: "Manage your Fennecly store.",
      },
    ],
  }),
});

function VoiceListener() {
  const { user } = useAuth();
  const { currentStore } = useCurrentStore();
  const { announceOrder } = useOrderVoice();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`new-orders-voice-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `store_owner_id=eq.${user.id}`,
        },
        (payload) => {
          const order = payload.new as Record<string, unknown>;
          announceOrder({
            orderNumber: (order.order_number as string) ?? String(order.id ?? "").slice(0, 8),
            customerName: (order.customer_name as string) ?? "عميل",
            wilaya: (order.shipping_wilaya as string) ?? (order.wilaya as string) ?? "غير محدد",
            total: (order.total as number) ?? (order.total_amount as number) ?? 0,
            paymentMethod: order.payment_method as string,
            productNames: [],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, currentStore?.id, announceOrder]);

  return null;
}

function AnimatedOutlet() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"fadeIn" | "fadeOut">("fadeIn");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  return (
      <div
        className={transitionStage === "fadeIn" ? "page-fade-in" : "page-fade-out"}
        onAnimationEnd={() => {
          if (transitionStage === "fadeOut") {
            setDisplayLocation(location);
            setTransitionStage("fadeIn");
          }
        }}
      >
        <Outlet />
      </div>
  );
}

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    [],
  );

  const [name, setName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const shortcutsGuide = useKeyboardShortcutsGuide();

  useEffect(() => {
    try {
      setSelectedStore(localStorage.getItem("selectedStore"));
    } catch (error) {
      console.warn(error);
    }
    setStoreHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!loading && !user) {
      navigate({ to: "/login" });
      return;
    }

    if (!loading && user && storeHydrated && !selectedStore) {
      navigate({ to: "/select-store" });
    }
  }, [loading, user, selectedStore, storeHydrated, navigate]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest("[data-sound]");
      if (!el) return;
      playSound(el.getAttribute("data-sound") as any);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("name, avatar_url, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      setName(data?.name ?? "");
      setAvatarUrl(data?.avatar_url ?? null);
      setOnboardingCompleted(data?.onboarding_completed ?? false);
    };

    load();

    const handler = () => load();

    window.addEventListener("profile:updated", handler);

    return () => {
      window.removeEventListener("profile:updated", handler);
    };
  }, [user]);

  if (loading && !user) {
    return <LogoLoader />;
  }

  if (!user) return null;

  const showWizard = onboardingCompleted === false;
  const isLoadingOnboarding = onboardingCompleted === null;

  if (isLoadingOnboarding) {
    return <LogoLoader />;
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingWizard
          userId={user.id}
          initialName={name}
          onComplete={() => setOnboardingCompleted(true)}
        />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CreditsProvider>
        <CurrentStoreProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <DashboardSidebar />

              <SidebarInset className="flex-1 flex flex-col min-w-0">
                <IOSInstallBanner />

                <DashboardTopbar name={name} avatarUrl={avatarUrl} />

                <main className="flex-1 p-4 md:p-8 min-h-0 overflow-y-auto overflow-x-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-background to-background">
                  <AnimatedOutlet />
                </main>
              </SidebarInset>
            </div>

            <PaywallDialog />
            <LoginPopup />
            <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
            <KeyboardShortcutsGuide open={shortcutsGuide.open} onClose={() => shortcutsGuide.setOpen(false)} />
            <VoiceListener />

            <Suspense fallback={null}>
              <WelcomeDialog userId={user.id} />
              <OnboardingTour userId={user.id} />
              <HelpChatbot />
              <AICopilot />
            </Suspense>
          </SidebarProvider>
        </CurrentStoreProvider>
      </CreditsProvider>
    </QueryClientProvider>
  );
}
