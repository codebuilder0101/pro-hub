// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // On Vercel, build the nitro server with the Vercel preset so SSR and server
  // functions (e.g. registerUser) deploy as Vercel functions and write the
  // Build Output API to .vercel/output. Locally this stays undefined, so the
  // normal Vite build is unchanged. (VERCEL=1 is set in Vercel's build env.)
  nitro: process.env.VERCEL ? { preset: "vercel" } : undefined,
});
