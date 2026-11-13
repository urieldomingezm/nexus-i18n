import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'es2020',
    lib: {
      entry: 'src/index.ts',
      name: 'NexusI18n',
      formats: ['es', 'cjs'],
      fileName: (f) => (f === 'es' ? 'nexus-i18n.js' : 'nexus-i18n.cjs'),
    },
    minify: 'esbuild',
  },
})
