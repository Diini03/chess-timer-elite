import { describe, expect, test } from "bun:test";
import { Chess } from "chess.js";
import { parseGame, principalVariation } from "./engine";

describe("position-grounded coaching", () => {
  test("rejects notes without legal game positions rather than supplying a sample", () => {
    expect(parseGame("I lost my queen and need advice")).toBeNull();
    expect(parseGame("1. e4 e5 2. Qh9")).toBeNull();
  });
  test("retains the user's actual played positions", () => {
    const game = parseGame("1. f3 e5 2. g4 Qh4#");
    expect(game?.history()).toEqual(["f3", "e5", "g4", "Qh4#"]);
    expect(game?.isCheckmate()).toBe(true);
  });
  test("converts engine lines to legal moves from the supplied position", () => {
    const chess = new Chess();
    chess.loadPgn("1. f3 e5 2. g4");
    expect(principalVariation(chess.fen(), ["d8h4", "a2a3"])).toEqual(["Qh4#"]);
    expect(principalVariation(new Chess().fen(), ["e2e4", "e7e5", "d1h9"])).toEqual(["e4", "e5"]);
  });
});