import React from './React（重构前）.js';
const ReactDOM = {
  createRoot(container) {
    return {
      render(el) {
        React.render(el, container);
      },
    };
  },
};
export default ReactDOM;
