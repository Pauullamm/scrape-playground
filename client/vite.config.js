import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
  server: {
    historyApiFallback: true
  },
  build: {
    sourcemap: false
  },
  plugins: [
    react(),
    obfuscatorPlugin({
      include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx',],
      exclude: ['src/supabaseClient/supabaseClient.js'],
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});