import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AuroraBackdrop } from "./AuroraBackdrop";

export function AuthLayout({
  title,
  lead,
  children,
  footer,
}: {
  title: string;
  lead: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-background via-brand to-background font-body text-foreground">
      <AuroraBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-white/10 font-grotesk text-base font-bold text-accent ring-1 ring-white/15">
            A
          </span>
          <span className="font-grotesk text-lg font-semibold tracking-tight">
            AURA<span className="text-accent">AUTO</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="glass rise w-full max-w-md rounded-3xl p-7 shadow-glass">
          <h1 className="font-grotesk text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-mist">{lead}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-mist">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
