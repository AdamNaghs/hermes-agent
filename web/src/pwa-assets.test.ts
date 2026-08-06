import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(import.meta.dirname, "..");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readWebFile(path: string): string {
  return readFileSync(resolve(WEB_ROOT, path), "utf8");
}

function expectPng(path: string): void {
  const absolutePath = resolve(WEB_ROOT, path);
  expect(existsSync(absolutePath), `${path} should exist`).toBe(true);
  expect(readFileSync(absolutePath).subarray(0, 8)).toEqual(PNG_SIGNATURE);
}

describe("dashboard PWA assets", () => {
  it("declares a standalone, root-scoped web app", () => {
    const manifest = JSON.parse(readWebFile("public/manifest.webmanifest"));

    expect(manifest).toMatchObject({
      name: "Hermes Agent",
      short_name: "Hermes",
      start_url: "sessions",
      scope: "./",
      display: "standalone",
    });
    expect(new URL(manifest.start_url, "https://dashboard.example/manifest.webmanifest").pathname).toBe(
      "/sessions",
    );
    expect(new URL(manifest.start_url, "https://dashboard.example/hermes/manifest.webmanifest").pathname).toBe(
      "/hermes/sessions",
    );
    expect(new URL(manifest.scope, "https://dashboard.example/manifest.webmanifest").pathname).toBe(
      "/",
    );
    expect(new URL(manifest.scope, "https://dashboard.example/hermes/manifest.webmanifest").pathname).toBe(
      "/hermes/",
    );
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "icons/hermes-192.png",
          sizes: "192x192",
          type: "image/png",
        }),
        expect.objectContaining({
          src: "icons/hermes-512.png",
          sizes: "512x512",
          type: "image/png",
        }),
      ]),
    );
  });

  it("links the manifest and Apple standalone metadata from the app shell", () => {
    const html = readWebFile("index.html");

    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="apple-mobile-web-app-status-bar-style"');
    expect(html).toContain('name="apple-mobile-web-app-title" content="Hermes"');
    expect(html).toContain('rel="apple-touch-icon" href="/icons/hermes-180.png"');
  });

  it("ships PNG icons for browser and Apple home-screen installation", () => {
    expectPng("public/icons/hermes-180.png");
    expectPng("public/icons/hermes-192.png");
    expectPng("public/icons/hermes-512.png");
  });
});
