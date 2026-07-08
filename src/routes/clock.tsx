import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ChessClock } from "@/components/ChessClock";

const searchSchema = z.object({
  tc: z.string().optional(),
});

export const Route = createFileRoute("/clock")({
  component: ClockPage,
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Tempo Clock — Play" },
      {
        name: "description",
        content:
          "The chess clock, full-screen. Bullet, blitz, rapid, and classical presets with Fischer increments.",
      },
    ],
  }),
});

function ClockPage() {
  const { tc } = Route.useSearch();
  return <ChessClock initialTimeControlId={tc} />;
}
