import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  assetsInclude: ['**/*.md'],
  plugins: [react()],
  build: {
    /**lib: {
      entry: path.resolve(__dirname, 'src/main.jsx'),
      name: 'SurveyWidget',
      fileName: (format) => `survey-widget.${format}.js`,
    },**/
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Внешние зависимости, если React уже есть на сайте,
      // или убираем external, если хотим все в одном файле (KISS)
      input: {
        main: path.resolve(__dirname, 'index.html') // входная точка - HTML файл
      },
      /**output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
      },**/
    },
  },
});
