import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

export default defineConfig({
  // Deploys set the subfolder (for example /branches/my-idea/); locally it stays '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react({ jsxImportSource: '@emotion/react' }),
    // While `npm run dev` runs, type errors and EUI rule breaks (eslint.config.js) show over the page.
    // Builds don't use it: `npm run check` covers them.
    checker({
      enableBuild: false,
      typescript: true,
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"', useFlatConfig: true },
    }),
  ],
  server: {
    // Run several prototypes side by side: PORT=5174 npm run dev
    port: Number(process.env.PORT ?? 5173),
  },
  build: {
    // EUI loads each icon as its own file. One bundle keeps every icon available on deploys.
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
