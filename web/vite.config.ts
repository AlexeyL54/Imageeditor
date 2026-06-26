import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Разрешаем доступ к папке на уровень выше (к корню проекта)
      allow: [
        path.resolve(__dirname, '..'), // <-- Это добавляет корневую папку проекта
      ],
    },
  },
})
