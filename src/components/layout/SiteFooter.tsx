import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-border py-8 text-sm text-mist sm:flex-row">
        <span>© 2026 AuraAuto. All rights reserved.</span>
        <div className="flex gap-6">
          <Link to="/about" className="transition hover:text-foreground">
            About
          </Link>
          <Link to="/financing" className="transition hover:text-foreground">
            Financing
          </Link>
          <Link to="/contact" className="transition hover:text-foreground">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
