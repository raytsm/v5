let instance;

// ScrollReveal reads the DOM at import time, so load it only in the browser.
const sr = {
  reveal(...args) {
    if (typeof window === 'undefined') {
      return;
    }
    if (!instance) {
      const module = require('scrollreveal');
      const ScrollReveal = module.default || module;
      instance = ScrollReveal();
    }
    return instance.reveal(...args);
  },
};

export default sr;
