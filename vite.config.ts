import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// See https://vite.dev/config/.
export default defineConfig({
  plugins: [react()],
})
