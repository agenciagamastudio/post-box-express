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
  // Mesma origem: o frontend serve as páginas e faz proxy das chamadas do backend
  // (publicação/OAuth/review/portal) para o servidor Node em :8787. Isso permite expor
  // tudo sob um único domínio (ngrok estático / deploy).
  vite: {
    server: {
      allowedHosts: true, // aceita o host do ngrok
      proxy: {
        "/api": { target: "http://localhost:8787", changeOrigin: true },
        "/auth": { target: "http://localhost:8787", changeOrigin: true },
        "/oauth": { target: "http://localhost:8787", changeOrigin: true },
        "/health": { target: "http://localhost:8787", changeOrigin: true },
        "/scheduler": { target: "http://localhost:8787", changeOrigin: true },
      },
    },
  },
});
