#!/usr/bin/env node
/**
 * Publisher hosted-load proof.
 *
 * Invoked by tools/build-spfx-package.ts at packaging time, this script
 * exercises the packaged `hb-publisher-app-<hash>.js` IIFE in a jsdom
 * window and drives `globalThis.__hbIntel_hbPublisher.mount()` through
 * both the success and failure paths documented in
 * `apps/hb-publisher/deployment/README.md`. The result is written as a
 * JSON proof artifact that the packaging pipeline can gate on.
 *
 * This is a synthetic proof — it does not contact a SharePoint tenant.
 * It evaluates the same bytes the CDN will serve, so it catches IIFE
 * evaluation failures, contract regressions, and the documented
 * failure-diagnostic path.
 *
 * Usage:
 *   node hb-publisher-hosted-load-proof.mjs \
 *     --bundle dist/sppkg/...extracted.../hb-publisher-app-<hash>.js \
 *     --output dist/sppkg/hb-publisher-hosted-load-proof.json \
 *     --globalName __hbIntel_hbPublisher \
 *     --runId <packaging-run-id> \
 *     --bundleName hb-publisher-app-<hash>.js \
 *     --manifestId 1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { JSDOM } from 'jsdom';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    if (!flag?.startsWith('--')) {
      throw new Error(`Unexpected argument ${flag}`);
    }
    out[flag.slice(2)] = argv[i + 1];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
for (const key of ['bundle', 'output', 'globalName', 'runId', 'bundleName', 'manifestId']) {
  if (!args[key]) {
    console.error(`Missing required --${key} argument`);
    process.exit(2);
  }
}

const bundlePath = path.resolve(args.bundle);
const outputPath = path.resolve(args.output);
const globalName = args.globalName;

const bundleSource = fs.readFileSync(bundlePath, 'utf8');
const unknownWebpartId = '00000000-0000-0000-0000-000000000000';
const details = [];
let contractPass = false;
let successPass = false;
let unmountPass = false;
let failurePass = false;
let hadException = false;

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  url: 'https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Article-Publisher.aspx',
  pretendToBeVisual: true,
  runScripts: 'outside-only',
});
const { window } = dom;

try {
  const sandbox = {
    globalThis: window,
    global: window,
    window,
    self: window,
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    Node: window.Node,
    MutationObserver: window.MutationObserver,
    queueMicrotask,
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    setImmediate: globalThis.setImmediate,
    clearImmediate: globalThis.clearImmediate,
    Promise,
    console,
    Object,
    Array,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Symbol,
    Error,
    TypeError,
    RangeError,
    JSON,
    Math,
    Date,
    RegExp,
    URL: window.URL,
    URLSearchParams: window.URLSearchParams,
    TextEncoder: window.TextEncoder ?? globalThis.TextEncoder,
    TextDecoder: window.TextDecoder ?? globalThis.TextDecoder,
    ArrayBuffer,
    Uint8Array,
    Int8Array,
    Float64Array,
    DataView,
    Proxy,
    Reflect,
    WeakRef: globalThis.WeakRef,
    FinalizationRegistry: globalThis.FinalizationRegistry,
    btoa: (s) => Buffer.from(String(s), 'binary').toString('base64'),
    atob: (s) => Buffer.from(String(s), 'base64').toString('binary'),
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    encodeURI,
    decodeURI,
    fetch: () => Promise.reject(new Error('fetch unavailable in hosted-load-proof synthetic environment')),
  };
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  new vm.Script(bundleSource, { filename: args.bundleName }).runInContext(ctx);

  const api = sandbox[globalName] ?? window[globalName];
  if (typeof api?.mount === 'function' && typeof api?.unmount === 'function') {
    contractPass = true;
    details.push(`contract: ${globalName}.mount + .unmount resolved from jsdom window/globalThis`);
  } else {
    details.push(`contract: ${globalName} did not expose mount + unmount (got: ${typeof api})`);
  }

  const host = window.document.createElement('div');
  host.setAttribute('id', 'hb-publisher-host');
  window.document.body.appendChild(host);

  // React 18 createRoot schedules work through the host's scheduler. In
  // jsdom + vm we must drain both microtasks and the macrotask queue
  // before inspecting the DOM — a bare `await mount()` is not enough
  // because the commit phase is deferred via MessageChannel/setTimeout.
  const flushRenderQueue = async () => {
    for (let i = 0; i < 3; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  };

  if (contractPass) {
    try {
      await api.mount(host, null, { webPartId: unknownWebpartId });
      await flushRenderQueue();
      const alert = host.querySelector('[role="alert"]');
      if (alert) {
        successPass = true;
        details.push(
          `success path: mount(host, null, { webPartId: "${unknownWebpartId}" }) attached an ` +
            `[role="alert"] fallback (the documented unsupported-webpart DOM), proving runtime load.`,
        );
      } else {
        details.push(
          `success path: mount() returned but did not attach the expected [role="alert"] fallback ` +
            `(host innerHTML length: ${host.innerHTML.length}).`,
        );
      }
    } catch (err) {
      details.push(`success path: mount() threw — ${err?.message ?? String(err)}`);
    }

    try {
      api.unmount();
      await flushRenderQueue();
      const residual = host.querySelector('[role="alert"]');
      if (!residual) {
        unmountPass = true;
        details.push('unmount path: unmount() detached React tree; host has no residual alert node.');
      } else {
        details.push('unmount path: unmount() ran but residual [role="alert"] still present.');
      }
    } catch (err) {
      details.push(`unmount path: unmount() threw — ${err?.message ?? String(err)}`);
    }

    try {
      await api.mount(null, null, { webPartId: unknownWebpartId });
      details.push(
        'failure path: mount(null, …) did not reject as expected — React createRoot should ' +
          'refuse a null container.',
      );
    } catch (err) {
      failurePass = true;
      details.push(
        `failure path: mount(null, …) surfaced the expected diagnostic — ${err?.message ?? String(err)}`,
      );
    }
  }
} catch (err) {
  hadException = true;
  details.push(`fatal: ${err?.message ?? String(err)}`);
}

const ok = contractPass && successPass && unmountPass && failurePass && !hadException;
const proof = {
  domain: 'hb-publisher',
  generatedAt: new Date().toISOString(),
  packagingRunId: args.runId,
  bundleName: args.bundleName,
  manifestId: args.manifestId,
  globalName,
  environment: 'node + jsdom + node:vm',
  checks: {
    contractProbe: { pass: contractPass, label: 'mount + unmount resolve from globalThis/window' },
    successPath: {
      pass: successPass,
      label: 'mount() attaches the unsupported-webpart fallback DOM (role="alert")',
    },
    unmountPath: { pass: unmountPass, label: 'unmount() detaches the React tree cleanly' },
    failurePath: {
      pass: failurePass,
      label: 'mount(null, …) surfaces the documented diagnostic error',
    },
  },
  details,
  pass: ok,
};

fs.writeFileSync(outputPath, `${JSON.stringify(proof, null, 2)}\n`);

if (!ok) {
  console.error(`hb-publisher-hosted-load-proof: FAIL (see ${outputPath})`);
  process.exit(1);
}
