import { describe, expect, it } from "vitest";
import { MAX_RECENT, addRecent } from "./useRecentSearches";

describe("addRecent", () => {
  it("puts the newest first and removes case-insensitive duplicates", () => {
    expect(addRecent(["queen", "abba"], "ABBA")).toEqual(["ABBA", "queen"]);
  });
  it("trims and collapses spaces, and ignores blanks", () => {
    expect(addRecent([], "  bohemian   rhapsody ")).toEqual(["bohemian rhapsody"]);
    expect(addRecent(["a"], "   ")).toEqual(["a"]);
  });
  it(`keeps at most ${MAX_RECENT}`, () => {
    let list: string[] = [];
    for (let i = 0; i < 10; i++) list = addRecent(list, `q${i}`);
    expect(list).toHaveLength(MAX_RECENT);
    expect(list[0]).toBe("q9");
  });
});
