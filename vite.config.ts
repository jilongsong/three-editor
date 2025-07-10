import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: './src/register/register.tsx', // ✅ 改为你的实际入口文件
      formats: ['iife'],
      name: 'MyReactEditor',
      fileName: () => 'three-editor_1.0.0.js',
    },
    rollupOptions: {
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})