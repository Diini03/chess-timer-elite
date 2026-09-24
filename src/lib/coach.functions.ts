import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  game: z.string().trim().min(10).max(20000),
  language: z.enum(["en", "ar"]).default("en"),
});

export const analyzeGame = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "AI is not configured." };

    const { streamText } = await import("ai");
    const { createOpenAI } = await import("@ai-sdk/openai");

    let runId: string | undefined;
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const res = await fetch(input, { ...init, headers });
        runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        return res;
      },
    });

    const lang = data.language === "ar" ? "Arabic" : "English";
    try {
      const result = streamText({
        model: lovable.responses("openai/gpt-6-astra"),
        maxRetries: 0,
        system:
          `You are a friendly, precise chess coach. The user gives a PGN or free-form game notes. ` +
          `Reply in ${lang}, plain text with short headings. Sections: Overview (2-3 sentences), ` +
          `Key mistakes (3-5 items: move number, what went wrong, the better idea), ` +
          `What went well, and Training tips (3 concrete items). If the input is not a chess game, say so briefly. ` +
          `Be honest when a move is ambiguous rather than inventing lines. Keep it under 450 words.`,
        prompt: data.game,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const text = (await result.text).trim();
      if (!text) return { ok: false as const, error: "The coach couldn't produce an analysis. Try adding more detail." };
      return { ok: true as const, text };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 429) return { ok: false as const, error: "Too many requests right now. Please wait a moment and try again." };
      if (status === 402 || status === 403) return { ok: false as const, error: "AI credits are used up for this workspace. Add credits to keep using the coach." };
      console.error(e);
      return { ok: false as const, error: "The coach is unavailable right now. Please try again later." };
    }
  });
