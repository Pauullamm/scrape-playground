import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      historyApiFallback: true,
    },
    define: {
      'import.meta.env': JSON.stringify(env), // Manually inject env variables
    },
    build: {
      sourcemap: false,
    },
    plugins: [
      react(),
      ...(mode === 'production' ? [obfuscatorPlugin({
        include: ['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'],
        exclude: [
          'src/supabaseClient/supabaseClient.js',
          'vite.config.js', // Exclude Vite config
        ],
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        numbersToExpressions: true,
        simplify: true,
        stringArrayShuffle: true,
        splitStrings: true,
        stringArrayThreshold: 1,
        ignoreRequireImports: true, // Prevents obfuscation of env vars
      })] : []), // Only include in production
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
