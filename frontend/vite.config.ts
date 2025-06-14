import path from "node:path"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['markmap-view', 'markmap-lib']
  },
  css: {
    // Enable CSS modules and preprocessing
    modules: {
      localsConvention: 'camelCase'
    }
  },
  optimizeDeps: {
    include: ['markmap-view', 'markmap-lib'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/markmap-.*/, /node_modules/]
    }
  },
  plugins: [react(), TanStackRouterVite()],
})
