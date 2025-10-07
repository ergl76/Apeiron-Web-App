import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FÜGE DIESEN GANZEN BLOCK HINZU:
  server: {
    // Macht den Server im lokalen Netzwerk erreichbar (für dein iPhone)
    host: true,

    // Erlaubt den Zugriff über jede ngrok-free.dev Adresse
    allowedHosts: [
      '.ngrok-free.dev',
      '.glanz.cc'
    ],
  },
})