import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileFrame } from "@/components/MobileFrame";
import { upcomingExpirations } from "@/lib/mock-data";
import { ArrowLeft, CalendarClock, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/landlord/leases/expiring")({ component: Expiring });

function Expiring() {
  const items = upcomingExpirations(60);

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col bg-background overflow-y-auto pb-8">
        <header className="px-6 pt-14 pb-4 flex items-center gap-3">
          <Link to="/landlord/leases" className="h-10 w-10 rounded-full bg-secondary grid place-items-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-mint font-semibold">Leases</p>
            <h1 className="text-2xl font-extrabold font-display leading-tight">Expiring soon</h1>
          </div>
        </header>

        <p className="px-6 text-xs text-muted-foreground leading-relaxed">
          Active leases in your portfolio expiring within the next 60 days. Ended leases are excluded.
        </p>

        <section className="px-6 mt-4 space-y-2">
          {items.map((l) => (
            <Link
              key={l.id}
              to="/landlord/leases/$leaseId"
              params={{ leaseId: l.id }}
              className="rounded-2xl border border-border bg-surface p-4 flex items-center gap-3"
            >
              <div className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${l.days <= 15 ? "bg-destructive/10 text-destructive" : "bg-mint/15 text-primary"}`}>
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{l.property} · {l.room}</p>
                <p className="text-xs text-muted-foreground truncate">{l.tenant}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Expires {l.end}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${l.days <= 15 ? "text-destructive" : "text-primary"}`}>{l.days}d</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </Link>
          ))}
          {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-10">No leases expiring in this window.</p>}
        </section>

        <p className="px-6 mt-6 text-[11px] text-muted-foreground leading-relaxed">
          Reminder timings (30 / 15 / 7 days) are configured per property under Property → Reminders.
        </p>
      </div>
    </MobileFrame>
  );
}
