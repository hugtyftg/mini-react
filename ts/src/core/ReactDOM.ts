import React from './React';
import { VirtualDOM } from './types';
const ReactDOM = {
  createRoot(container: HTMLElement) {
    return {
      render(el: VirtualDOM) {
        React.render(el, container);
      },
    };
  },
};
export default ReactDOM;
