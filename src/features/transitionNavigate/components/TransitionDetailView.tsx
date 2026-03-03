"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  TRANSITIONS,
  TRANSITION_MAP,
  toTransitionPath,
  type TransitionId,
} from "@/features/transitionNavigate/constants/registry";
import { useTransitionNavigate } from "@/features/transitionNavigate/hooks/useTransitionNavigate.hook";
import { Button } from "@/shared/components/ui/button";

export function TransitionDetailView({
  transitionId,
}: {
  transitionId: TransitionId;
}) {
  const pathname = location.pathname;
  const { transitionNavigate } = useTransitionNavigate();

  const transition = TRANSITION_MAP[transitionId];
  const basePath = toTransitionPath(transitionId);
  const loopPath = `${basePath}/loop`;
  const isLoopMode = pathname === loopPath;
  const currentIndex = TRANSITIONS.findIndex(
    (item) => item.id === transitionId,
  );
  const previous =
    TRANSITIONS[(currentIndex - 1 + TRANSITIONS.length) % TRANSITIONS.length];
  const next = TRANSITIONS[(currentIndex + 1) % TRANSITIONS.length];

  return (
    <div className="flex min-h-full flex-col justify-between gap-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Active Transition
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          {transition.label}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {transition.description} ลองกดเปลี่ยนไปหน้าอื่นเพื่อดู animation
          ระหว่างการนำทาง
        </p>
      </div>

      <div className="space-y-3">
        <section className="rounded-2xl border bg-muted/40 p-4">
          <p className="mb-2 text-sm font-medium">Hook Action Panel</p>
          <p className="text-sm text-muted-foreground">
            ปุ่มด้านล่างใช้ `useTransitionNavigate` โดยตรง เพื่อยิงการนำทางพร้อม
            animation
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              className="sm:flex-1"
              onClick={() => transitionNavigate(toTransitionPath(previous.id))}
            >
              <ArrowLeft />
              Previous: {previous.label}
            </Button>
            <Button
              className="sm:flex-1"
              onClick={() => transitionNavigate(toTransitionPath(next.id))}
            >
              Next: {next.label}
              <ArrowRight />
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-muted/40 p-4">
          <p className="mb-2 text-sm font-medium">Same Transition Loop</p>
          <p className="text-sm text-muted-foreground">
            สลับ View A/B เพื่อกดกลับไปกลับมาใน transition เดิมได้เลย
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant={isLoopMode ? "outline" : "default"}
              className="sm:flex-1"
              onClick={() => transitionNavigate(basePath)}
            >
              View A (/{transition.id})
            </Button>
            <Button
              variant={isLoopMode ? "default" : "outline"}
              className="sm:flex-1"
              onClick={() => transitionNavigate(loopPath)}
            >
              View B (/{transition.id}/loop)
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
