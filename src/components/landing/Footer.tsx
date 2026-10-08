import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Twitter, Github, Linkedin, Instagram, QrCode } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  const socials = [
    { Icon: Twitter, href: "#", label: t("footer.socialTwitter") },
    { Icon: Github, href: "#", label: t("footer.socialGithub") },
    { Icon: Linkedin, href: "#", label: t("footer.socialLinkedin") },
    { Icon: Instagram, href: "#", label: t("footer.socialInstagram") },
  ];

  const sections = [
    { title: t("footer.product"), links: [t("footer.features"), t("footer.pricing"), t("footer.themes"), t("footer.integrations")] },
    { title: t("footer.company"), links: [t("footer.about"), t("footer.contact"), t("footer.careers"), t("footer.blog")] },
    { title: t("footer.legal"), links: [t("footer.privacy"), t("footer.terms"), t("footer.security"), t("footer.cookies")] },
  ];

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25" />
              <span className="font-display font-semibold text-lg">Fennecly</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t("footer.tagline")}</p>
            <Link
              to="/tools/qr-code"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              {t("footer.qrTool")}
            </Link>
            <div className="mt-6 flex gap-2">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold">{s.title}</h4>
              <ul className="mt-4 space-y-3">
                {s.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Fennecly, Inc. {t("footer.rights")}
          </p>
          <p className="text-xs text-muted-foreground">{t("footer.made")}</p>
        </div>
      </div>
    </footer>
  );
}
