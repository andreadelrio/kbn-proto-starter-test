// Builds the versions page at the root of the published site (src/versions/). Used by the deploy:
//   BASE_PATH=/ npx vite build --config vite.versions.config.ts
import { mergeConfig } from 'vite';
import config from './vite.config';

export default mergeConfig(config, {
  build: {
    outDir: 'dist-versions',
    // Its files sit next to the branch folders at the site root, so keep them in one folder of their own.
    assetsDir: '_versions',
    rollupOptions: { input: 'versions.html' },
  },
});
