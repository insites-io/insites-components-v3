import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'insites',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'docs-readme' },
    { type: 'www', serviceWorker: null }
  ],
  enableCache: false,
  // Bind the dev server to localhost, not 0.0.0.0. @stencil/playwright derives the test baseURL
  // from this address, and Chromium refuses to navigate to http://0.0.0.0:3333/, so with the
  // default every setContent() hung until the test timeout (TW#26737045).
  devServer: { address: 'localhost', port: 3333, openBrowser: false },
  sourceMap: false,
  extras: {
    enableImportInjection: true,
  },
  plugins: [
    sass()
  ]
};
