import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts
export default defineConfig({
  base: "/",

  tanstackStart: {
    server: { entry: "server" },
  },

  vite: {
    server: {
      host: "0.0.0.0",
    },

    preview: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
  },
});
