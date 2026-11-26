'use strict';

const runtimeLoader = 'https://cjrtnc.leaningtech.com/5.0/loader.js';
let runtime;

async function loadRuntime() {
  importScripts(runtimeLoader);
  await cheerpjInit({ version: 17, status: 'none' });
  const jarResponse = await fetch(new URL('./java-runner/BrowserJavaRunner.jar?v=java-workshop-1', self.location.href));
  if (!jarResponse.ok) throw new Error('Could not load the Java lab helper.');
  cheerpOSAddStringFile('/str/BrowserJavaRunner.jar', new Uint8Array(await jarResponse.arrayBuffer()));
  const library = await cheerpjRunLibrary('/str/BrowserJavaRunner.jar');
  return library.cs201.runner.BrowserJavaRunner;
}

self.onmessage = async ({ data }) => {
  try {
    runtime ??= loadRuntime();
    const runner = await runtime;
    self.postMessage({ type: 'compiling' });
    const compiled = String(await runner.compile(data.className, data.source));
    self.postMessage({ type: 'compiled', result: compiled });
    if (!compiled.startsWith('OK\n')) return;
    for (const [index, input] of data.inputs.entries()) {
      self.postMessage({ type: 'running', index });
      const result = String(await runner.run(data.className, input));
      self.postMessage({ type: 'result', index, result });
    }
    self.postMessage({ type: 'finished' });
  } catch (error) {
    self.postMessage({ type: 'worker-error', detail: String(error?.message ?? error) });
  }
};
