import { defineConfig } from "vite"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      lib: path.resolve(import.meta.dirname, "lib"),
      tests: path.resolve(import.meta.dirname, "tests"),
    },
  },
})
