import { VNodeType, VirtualDOM } from './types';
import { TEXT_ELEMENT } from './types/constants';

function createTextNode(nodeValue: string | number): VirtualDOM {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue,
      children: [],
    },
  };
}
function createElement(
  type: VNodeType,
  props: any,
  ...children: Array<VirtualDOM>
): VirtualDOM {
  return {
    type,
    props: {
      ...props,
      children: children.map((child: any) => {
        return /^(string|number)/.test(typeof child)
          ? createTextNode(child)
          : child;
      }),
    },
  };
}
function render(el: VirtualDOM, container: HTMLElement) {
  // 1.createElement
  const dom = createDOMNode(el.type);
  // 2.props
  updateProps(dom, el.props);
  initChildren(dom, el.props.children);
  container.append(dom);
}
function createDOMNode(type: string): HTMLElement | Text {
  return type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(type);
}
function updateProps(dom: HTMLElement | Text, props: any) {
  Object.keys(props).forEach((prop: string) => {
    if (prop !== 'children') {
      switch (prop) {
        case 'style':
          const styleObj = props.style;
          Object.keys(styleObj).forEach((styleKey) => {
            (dom as HTMLElement).style[styleKey] = styleObj[styleKey];
          });
          break;
        case 'class':
          (dom as HTMLElement).className = props.class;
          break;
        default:
          dom[prop] = props[prop];
          break;
      }
    }
  });
}
function initChildren(dom, children: Array<VirtualDOM>) {
  children.forEach((child: VirtualDOM) => {
    render(child, dom);
  });
}
const React = {
  createElement,
  render,
};
export default React;
