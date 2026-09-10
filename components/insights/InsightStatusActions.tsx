"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateInsightStatus } from "@/app/(dashboard)/insights/actions";

type InsightStatus =
  | "new"
  | "viewed"
  | "investigating"
  | "action_taken"
  | "resolved";

type InsightStatusActionsProps = {
  insightId: string;
  status: InsightStatus;
};

export function InsightStatusActions({
  insightId,
  status,
}: InsightStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeStatus(nextStatus: InsightStatus) {
    startTransition(async () => {
      await updateInsightStatus(insightId, nextStatus);
    });
  }

  if (status === "new") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeStatus("viewed")}
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Mark as viewed"}
      </button>
    );
  }

  if (status === "viewed") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await updateInsightStatus(insightId, "investigating");

            router.push(`/insights/${insightId}`);
          });
        }}
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Opening..." : "Start investigating"}
      </button>
    );
  }

  if (status === "investigating") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeStatus("action_taken")}
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Mark action taken"}
      </button>
    );
  }

  if (status === "action_taken") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeStatus("resolved")}
        className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Resolve insight"}
      </button>
    );
  }

  return <span className="text-sm text-muted-foreground">Resolved</span>;
}
