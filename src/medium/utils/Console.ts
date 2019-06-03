const enabled = true;

export const log = (() => {
  if (!window.console || !console.log) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.log, console);
})();

export const clear = (() => {
  if (!window.console || !console.clear) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.clear, console);
})();

export const debug = (() => {
  if (!window.console || !console.debug) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.debug, console);
})();

export const info = (() => {
  if (!window.console || !console.info) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.info, console);
})();

export const warn = (() => {
  if (!window.console || !console.warn) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.warn, console);
})();

export const error = (() => {
  if (!window.console || !console.error) {
    return () => {
      return;
    };
  }
  if (!enabled)
    return () => {
      return;
    };
  return Function.prototype.bind.call(console.error, console);
})();
