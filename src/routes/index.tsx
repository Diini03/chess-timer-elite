import { createFileRoute } from "@tanstack/react-router";
import { ChessClock } from "@/components/ChessClock";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Chess Clock — Premium Mobile Timer" },
      { name: "description", content: "A minimal, premium chess clock for over-the-board play. Bullet, blitz, rapid, and classical presets with Fischer increments." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" },
    ],
  }),
});

function Index() {
  return <ChessClock />;
}
