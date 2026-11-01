import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: resolve(import.meta.dirname, '../Resources/Public/JavaScript'),
    emptyOutDir: false,
    target: 'es2022',
    minify: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: () => 'options-import.js',
    },
    rollupOptions: {
      // TYPO3 provides these through its import map.
      external: [/^@typo3\//, 'lit', /^lit\//],
    },
  },
})
