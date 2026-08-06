import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const APP_SOURCE = readFileSync(resolve(import.meta.dirname, "App.tsx"), "utf8");

describe("mobile safe-area layout", () => {
  it("keeps the mobile header control, content, and drawer below the iOS status area", () => {
    expect(APP_SOURCE).toContain("min-h-[calc(3.5rem+env(safe-area-inset-top))]");
    expect(APP_SOURCE).toContain("pt-[calc(0.5rem+env(safe-area-inset-top))]");
    expect(APP_SOURCE).toContain("pt-[calc(3.5rem+env(safe-area-inset-top))]");
    expect(APP_SOURCE).toContain("pt-[env(safe-area-inset-top)] lg:pt-0");
  });
});
