import path from "node:path"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  css: {
    // Enable CSS modules and preprocessing
    modules: {
      localsConvention: 'camelCase'
    }
  },
  optimizeDeps: {
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  plugins: [react(), TanStackRouterVite()],
})
