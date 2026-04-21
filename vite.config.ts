import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const styleFiles = ['tokens.css', 'base.css', 'animations.css', 'utilities.css'] as const;

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8'),
) as { version: string };

export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo' || process.env.DEMO === '1';

  if (isDemo) {
    return {
      root: 'demo',
      base: './',
      server: { port: 4321, open: true },
      define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
      },
      build: {
        outDir: '../docs',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(__dirname, 'demo/index.html'),
            htmx: resolve(__dirname, 'demo/htmx.html'),
            vanilla: resolve(__dirname, 'demo/vanilla.html'),
          },
        },
      },
    };
  }

  return {
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          'components/button/index': resolve(__dirname, 'src/components/button/index.ts'),
          'components/badge/index': resolve(__dirname, 'src/components/badge/index.ts'),
          'components/avatar/index': resolve(__dirname, 'src/components/avatar/index.ts'),
          'components/card/index': resolve(__dirname, 'src/components/card/index.ts'),
          'components/input/index': resolve(__dirname, 'src/components/input/index.ts'),
          'components/theme-toggle/index': resolve(
            __dirname,
            'src/components/theme-toggle/index.ts',
          ),
          'components/modal/index': resolve(__dirname, 'src/components/modal/index.ts'),
          'components/compat-ring/index': resolve(
            __dirname,
            'src/components/compat-ring/index.ts',
          ),
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: (id) => id === 'lit' || id.startsWith('lit/') || id.startsWith('lit-html') || id.startsWith('@lit/'),
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        },
      },
      sourcemap: true,
      target: 'es2022',
      minify: false,
    },
    plugins: [
      {
        name: 'kawaii-ui:copy-styles',
        closeBundle() {
          mkdirSync(resolve(__dirname, 'dist/styles'), { recursive: true });
          let bundled = '';
          for (const file of styleFiles) {
            const src = resolve(__dirname, 'src/styles', file);
            const dest = resolve(__dirname, 'dist/styles', file);
            const content = readFileSync(src, 'utf-8');
            copyFileSync(src, dest);
            bundled += `/* ${file} */\n${content}\n\n`;
          }
          writeFileSync(resolve(__dirname, 'dist/styles/all.css'), bundled);
        },
      },
    ],
  };
});
