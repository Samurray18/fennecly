import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { FennecyLogo } from "@/components/ui/fennecy-logo";
import { cn } from "@/lib/utils";

function DarkModeToggle() {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    let dark = false;
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      dark = stored === "dark" || (!stored && prefersDark);
    } catch (error) {
      console.warn(error);
    }
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (error) {
      console.warn(error);
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground"
      aria-label={t("nav.toggleDark")}
    >
      {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { label: t("nav.features"), href: "#features" },
    { label: t("nav.how"), href: "#how" },
    { label: t("nav.pricing"), href: "#pricing" },
    { label: t("nav.testimonials"), href: "#testimonials" },
    { label: t("nav.themes"), href: "/themes", isRoute: true },
    { label: t("nav.tools"), href: "/tools/qr-code", isRoute: true },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className={cn(
          "mx-auto max-w-6xl px-4 transition-all duration-300",
          scrolled ? "mt-2" : "mt-4",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300",
            scrolled
              ? "border border-border/40 bg-background/75 backdrop-blur-xl shadow-sm"
              : "border border-transparent bg-background/50 backdrop-blur-md",
          )}
        >
          <a href="#" className="flex items-center gap-2 shrink-0">
            <FennecyLogo className="h-9 w-[120px] sm:h-11 sm:w-[160px]" />
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) =>
              (l as { isRoute?: boolean }).isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-foreground after:scale-x-0 after:origin-center after:transition-transform hover:after:scale-x-100"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-foreground after:scale-x-0 after:origin-center after:transition-transform hover:after:scale-x-100"
                >
                  {l.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline-flex">
              <LanguageSwitcher />
            </span>
            <DarkModeToggle />
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex h-9">
              <Link to="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="h-9 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Link to="/signup">{t("nav.getStarted")}</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 rounded-xl text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t("nav.toggleMenu")}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={cn(
            "fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l border-border/40 shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border/30">
            <FennecyLogo className="h-8 w-[110px]" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {links.map((l) =>
              (l as { isRoute?: boolean }).isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {l.label}
                </a>
              ),
            )}
            <hr className="my-3 border-border/30" />
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t("nav.signIn")}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-4 py-3 rounded-xl text-sm font-semibold text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
            >
              {t("nav.getStarted")}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
