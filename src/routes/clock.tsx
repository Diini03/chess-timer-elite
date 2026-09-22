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
      { title: "Taktik Clock — Play" },
      {
        name: "description",
        content:
          "The chess clock, full-screen. Bullet, blitz, rapid, and classical presets with Fischer increments.",
       },
       { property: "og:title", content: "Taktik Clock — Play" },
       { property: "og:description", content: "A precise full-screen chess clock with tournament-ready presets." },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ClockPage() {
  const { tc } = Route.useSearch();
  return <ChessClock initialTimeControlId={tc} />;
}
