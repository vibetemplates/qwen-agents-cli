/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import Module from 'node:module';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const userlandPunycode = require.resolve('punycode/');
// Module._load is intentionally patched; it is not part of the public API.
const moduleAny = Module as unknown as {
  _load: (request: string, parent: unknown, isMain?: boolean) => unknown;
};
const originalLoad = moduleAny._load;

// Redirect any punycode import (core or node: namespace) to the userland module.
moduleAny._load = function patchedLoad(
  request: string,
  parent: unknown,
  isMain?: boolean,
) {
  if (request === 'punycode' || request === 'node:punycode') {
    return originalLoad(userlandPunycode, parent, isMain);
  }
  return originalLoad(request, parent, isMain);
};
