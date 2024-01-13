import React from './React.js';
const ReactDOM = {
  createRoot(container) {
    return {
      render(el) {
        React.renderPlus(el, container);
      },
    };
  },
};
export default ReactDOM;
