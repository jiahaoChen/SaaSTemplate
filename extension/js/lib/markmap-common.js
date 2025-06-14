(function (global) {
  'use strict';

  // Hook class for callbacks
  class Hook {
    constructor() {
      this.listeners = [];
    }
    
    tap(fn) {
      this.listeners.push(fn);
      return () => this.revoke(fn);
    }
    
    revoke(fn) {
      const i = this.listeners.indexOf(fn);
      if (i >= 0) this.listeners.splice(i, 1);
    }
    
    revokeAll() {
      this.listeners.splice(0);
    }
    
    call(...args) {
      for (const fn of this.listeners) {
        fn(...args);
      }
    }
  }

  // Generate a unique ID
  const uniqId = Math.random().toString(36).slice(2, 8);
  let globalIndex = 0;
  
  function getId() {
    globalIndex += 1;
    return `mm-${uniqId}-${globalIndex}`;
  }

  // No operation function
  function noop() {
    // Do nothing
  }

  // Walk through a tree structure
  function walkTree(tree, callback) {
    const walk = (item, parent) => callback(
      item,
      () => {
        var children = item.children;
        return children?.map((child) => walk(child, item));
      },
      parent
    );
    return walk(tree);
  }

  // Add class to className string
  function addClass(className, ...rest) {
    const classList = (className || '').split(' ').filter(Boolean);
    rest.forEach((item) => {
      if (item && classList.indexOf(item) < 0) classList.push(item);
    });
    return classList.join(' ');
  }

  // Create a deferred object
  function defer() {
    const obj = {};
    obj.promise = new Promise((resolve, reject) => {
      obj.resolve = resolve;
      obj.reject = reject;
    });
    return obj;
  }

  // Memoize a function
  function memoize(fn) {
    const cache = {};
    return function memoized(...args) {
      const key = `${args[0]}`;
      let data = cache[key];
      if (!data) {
        data = {
          value: fn(...args)
        };
        cache[key] = data;
      }
      return data.value;
    };
  }

  // Debounce a function
  function debounce(fn, time) {
    const state = {
      timer: 0
    };
    
    function reset() {
      if (state.timer) {
        window.clearTimeout(state.timer);
        state.timer = 0;
      }
    }
    
    function run() {
      reset();
      if (state.args) state.result = fn(...state.args);
    }
    
    return function debounced(...args) {
      reset();
      state.args = args;
      state.timer = window.setTimeout(run, time);
      return state.result;
    };
  }

  // Load JS dynamically
  async function loadJS(items, context) {
    if (!items || !items.length) return;
    if (!Array.isArray(items)) items = [items];
    
    for (const item of items) {
      if (!item) continue;
      const script = document.createElement('script');
      script.src = item;
      if (context) script.dataset.context = context;
      document.body.append(script);
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }
  }

  // Load CSS dynamically
  async function loadCSS(items) {
    if (!items || !items.length) return;
    if (!Array.isArray(items)) items = [items];
    
    for (const item of items) {
      if (!item) continue;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = item;
      document.head.append(link);
    }
  }

  // Export to global
  global.markmapCommon = {
    Hook,
    getId,
    noop,
    walkTree,
    addClass,
    defer,
    memoize,
    debounce,
    loadJS,
    loadCSS
  };
})(window);