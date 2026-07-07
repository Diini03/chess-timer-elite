import { createFileRoute } from "@tanstack/react-router";
import { ChessClock } from "@/components/ChessClock";

export const Route = createFileRoute("/clock")({
  component: ClockPage,
  head: () => ({
    meta: [
      { title: "Tempo Clock — Play" },
      { name: "description", content: "The chess clock, full-screen. Bullet, blitz, rapid, and classical presets with Fischer increments." },
    ],
  }),
});

function ClockPage() {
  return <ChessClock />;
}
