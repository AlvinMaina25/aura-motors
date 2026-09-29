import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

const links = [
  { to: "/browse", label: "Browse" },
  { to: "/sell", label: "Sell your car" },
  { to: "/financing", label: "Financing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useFavorites();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    void navigate({ to: "/" });
  };

  return (
    <header className="relative z-30">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 font-grotesk text-base font-bold text-accent ring-1 ring-white/15">
            A
          </span>
          <span className="truncate font-grotesk text-lg font-semibold tracking-tight">
            AURA<span className="text-accent">AUTO</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-8 text-sm text-mist md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link to="/account/favorites" className="icon-btn relative size-9" aria-label="Favorites">
            <Heart className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden text-sm text-mist transition hover:text-foreground sm:block"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/account"
                className="hidden text-sm text-mist transition hover:text-foreground sm:block"
              >
                {user.email}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-light hidden px-4 py-2 sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm text-mist transition hover:text-foreground sm:block"
              >
                Sign in
              </Link>
              <Link to="/signup" className="btn-light hidden px-4 py-2 sm:inline-flex">
                Get Started
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="icon-btn size-9 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-6 md:hidden">
          <div className="glass rise flex flex-col gap-1 rounded-2xl p-3">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm text-mist transition hover:bg-white/5 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="btn-glass col-span-2"
                    >
                      Admin
                    </Link>
                  )}
                  <Link to="/account" onClick={() => setOpen(false)} className="btn-glass">
                    Account
                  </Link>
                  <button type="button" onClick={handleSignOut} className="btn-accent">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-glass">
                    Sign in
                  </Link>
                  <Link to="/signup" onClick={() => setOpen(false)} className="btn-accent">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
