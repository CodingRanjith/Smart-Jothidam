import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, __dirname, '')
  
  return {
    plugins: [react(), tailwindcss()],
    // Explicitly define env variables
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY || ''),
    },
    // Configure for WASM files (Swiss Ephemeris)
    server: {
      fs: {
        allow: ['..']
      }
    },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
      exclude: ['swisseph-wasm']
    }
  }
})
