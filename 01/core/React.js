function createTextNode(nodeValue) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      // textNode节点只有nodeValue属性需要传入
      nodeValue,
      children: [],
    },
  };
}
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        // react的createElement对于string和number都是直接渲染的，boolean null undefined不会被渲染
        return /^(string|number)/.test(typeof child)
          ? createTextNode(child)
          : child;
      }),
    },
  };
}
function render(el, container) {
  // 根据type创建dom
  const dom =
    el.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(el.type);

  // 给dom添加上除了children之外的属性
  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });
  // 递归处理children
  el.props.children.forEach((child) => {
    render(child, dom);
  });
  container.append(dom);
}
const React = {
  render,
  createElement,
};
export default React;
