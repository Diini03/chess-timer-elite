import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Chess } from "chess.js";
import { parseGame, principalVariation } from "./engine";

describe("position-grounded coaching", () => {
  test("rejects notes without legal game positions rather than supplying a sample", () => {
    assert.equal(parseGame("I lost my queen and need advice"), null);
    assert.equal(parseGame("1. e4 e5 2. Qh9"), null);
  });
  test("retains the user's actual played positions", () => {
    const game = parseGame("1. f3 e5 2. g4 Qh4#");
    assert.deepEqual(game?.history(), ["f3", "e5", "g4", "Qh4#"]);
    assert.equal(game?.isCheckmate(), true);
  });
  test("converts engine lines to legal moves from the supplied position", () => {
    const chess = new Chess();
    chess.loadPgn("1. f3 e5 2. g4");
    assert.deepEqual(principalVariation(chess.fen(), ["d8h4", "a2a3"]), ["Qh4#"]);
    assert.deepEqual(principalVariation(new Chess().fen(), ["e2e4", "e7e5", "d1h9"]), ["e4", "e5"]);
  });
});