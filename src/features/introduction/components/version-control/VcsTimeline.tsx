import type { VcsTimelineEvent } from "@/features/introduction/constants/version-control-content.constant";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

type VcsTimelineProps = {
  events: VcsTimelineEvent[];
};

export function VcsTimeline({ events }: VcsTimelineProps) {
  const [activeId, setActiveId] = useState(events[0]?.id ?? "");
  const activeEvent = events.find((event) => event.id === activeId) ?? events[0];

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="text-xs font-semibold text-amber-800">Timeline Milestones</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {events.map((event) => {
          const isActive = event.id === activeId;
          return (
            <button
              key={event.id}
              type="button"
              aria-pressed={isActive}
              onMouseEnter={() => setActiveId(event.id)}
              onFocus={() => setActiveId(event.id)}
              onClick={() => setActiveId(event.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-amber-200 bg-white text-amber-800 hover:bg-amber-100",
              )}
            >
              {event.era}
            </button>
          );
        })}
      </div>

      {activeEvent ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">{activeEvent.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{activeEvent.detail}</p>
        </div>
      ) : null}
    </div>
  );
}
