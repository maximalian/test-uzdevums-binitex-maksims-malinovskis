import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// See https://vite.dev/config/.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ecdc': {
        target: 'https://opendata.ecdc.europa.eu',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/ecdc/, ''),
      },
    },
  },
})
