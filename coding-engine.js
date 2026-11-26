'use strict';

window.CS201Java = (() => {
  const { bi: b } = CS201;
  const workerUrl = new URL('java-runner-worker.js?v=java-workshop-1', document.currentScript.src);
  const utf8 = new TextEncoder();
  const decoder = new TextDecoder();

  function encode(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    return btoa(binary);
  }

  function decode(text) {
    return decoder.decode(Uint8Array.from(atob(text ?? ''), (character) => character.charCodeAt(0)));
  }

  function failure(kind, detail) {
    return Object.assign(new Error(kind), { kind, detail });
  }

  let worker;
  let warmedUp = false;
  let idleTimer;

  function shutDown() {
    clearTimeout(idleTimer);
    worker?.terminate();
    worker = null;
    warmedUp = false;
  }

  function keepWarm() {
    idleTimer = setTimeout(shutDown, 180000);
  }

  function run({ className, source, inputs, signal, onPhase, onResult }) {
    const inputBytes = inputs.map((input) => utf8.encode(input));
    if (utf8.encode(source).length > 128 * 1024 || inputBytes.some((bytes) => bytes.length > 3 * 1024 * 1024)) {
      return Promise.reject(failure('limit'));
    }
    return new Promise((resolve, reject) => {
      try {
        clearTimeout(idleTimer);
        worker ??= new Worker(workerUrl);
      } catch (error) {
        reject(failure('unavailable', error.message));
        return;
      }

      let timer;
      let diagnostics = '';
      const current = worker;
      function clear() {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        current.onmessage = null;
        current.onerror = null;
      }
      function rejectRun(error, reset = true) {
        clear();
        if (reset) shutDown();
        else keepWarm();
        reject(error);
      }
      function abort() {
        rejectRun(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      }
      function deadline(ms) {
        clearTimeout(timer);
        timer = setTimeout(() => rejectRun(failure('timeout')), ms);
      }
      if (signal.aborted) {
        abort();
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
      current.onerror = (event) => {
        event.preventDefault();
        rejectRun(failure('unavailable', event.message));
      };
      current.onmessage = ({ data }) => {
        try {
          switch (data.type) {
            case 'compiling':
              onPhase('compiling');
              deadline(warmedUp ? 15000 : 65000);
              break;
            case 'compiled': {
              const [status, detail] = data.result.split('\n');
              diagnostics = decode(detail);
              warmedUp = true;
              if (status === 'COMPILE_ERROR') rejectRun(failure('compile', diagnostics), false);
              else if (status !== 'OK') rejectRun(failure('unavailable', status));
              else deadline(15000);
              break;
            }
            case 'running':
              onPhase('running', data.index);
              deadline(data.index === 0 ? 15000 : 10000);
              break;
            case 'result': {
              const [status, out, err] = data.result.split('\n');
              const names = { OK: 'ok', RUNTIME_ERROR: 'runtime', OUTPUT_LIMIT: 'limit' };
              onResult({ status: names[status] ?? 'runtime', stdout: decode(out), stderr: decode(err) }, data.index);
              deadline(10000);
              break;
            }
            case 'finished':
              clear();
              keepWarm();
              resolve({ diagnostics });
              break;
            case 'worker-error':
              rejectRun(failure('unavailable', data.detail));
              break;
          }
        } catch (error) {
          rejectRun(failure('unavailable', error.message));
        }
      };
      deadline(warmedUp ? 15000 : 90000);
      current.postMessage({ className, source, inputs: inputBytes.map(encode) });
    });
  }

  return {
    run,
    note: b('Java 17 在浏览器内编译和运行。首次运行需联网加载运行时，代码运行本身在当前设备上完成。', 'Java 17 compiles and runs in your browser. The first run downloads the runtime over the network.'),
    credit: { label: 'Built with CheerpJ', href: 'https://cheerpj.com/' }
  };
})();
