/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import path from 'node:path';

const PACKAGE_ROOT = __dirname;
const PACKAGE_NAME = 'extensions/kube-context';

/**
 * Default project code coverage configuration for vitest
 * @param {*} packageRoot root of the project where coverage is being calculated
 * @param {*} packageName package name to appear in test-resources/coverage in project root folder
 * @returns object for code coverage configuration
 */
export function coverageConfig(packageRoot, packageName) {
  const obj = { coverage: {
      all: true,
      clean: true,
      src: [packageRoot],
      exclude: [
        '**/builtin/**',
        '**/dist/**',
        '**/node_modules/**',
        '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.{tsx,cjs,js,d.ts}',
        '**/*-info.ts',
        '**/.{cache,git,idea,output,temp,cdix}/**',
        '**/*{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tailwind,postcss}.config.*',
      ],
      provider: 'v8',
      reportsDirectory: path.join(packageRoot, `test-resources/coverage/${packageName}`),
      reporter: ['lcov', 'text'],
    },
  };
  return obj;
}

export function testConfig() {
  return {
    globals: true,
    globalSetup: './tests/globalSetup/global-setup.ts',
    setupFiles: './tests/setupFiles/extended-hooks.ts',
    /**
     * By default, vitest search test files in all packages.
     * For e2e tests have sense search only is project root tests folder
     */
    include: ['**/tests/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/builtin/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp,cdix}/**',
      '**/{rollup,vite,vitest*}.config.*',
    ],

    /**
     * A default timeout of 5000ms is sometimes not enough for playwright.
     */
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // test reporters - default for all and junit for CI
    reporters: process.env.CI ? ['default', 'junit'] : ['verbose'],
    outputFile: process.env.CI ? { junit: 'tests/output/junit-results.xml' } : {},
  };
}

/**
 * Config for global end-to-end tests
 * placed in project root tests folder
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */

const config = {
  test: {
    ...testConfig(),
    ...coverageConfig(PACKAGE_ROOT, PACKAGE_NAME),
  },
  resolve: {
    alias: {
      '@podman-desktop/api': path.resolve(PACKAGE_ROOT, '__mocks__/@podman-desktop/api.js'),
    },
  },
};

export default config;
