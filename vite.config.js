import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.md'],
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.jsx'),
      name: 'SurveyWidget',
      fileName: (format) => `survey-widget.${format}.js`,
    },
    rollupOptions: {
      // Внешние зависимости, если React уже есть на сайте,
      // или убираем external, если хотим все в одном файле (KISS)
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
      },
    },
  },
});