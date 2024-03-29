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
// render是主入口，所以应该在render的时候为任务初始化赋值
function render(el, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };
}
let nextWorkOfUnit = null;
function workLoop(idleDeadline) {
  let shouldYield = false;
  // 当前剩余时间充足并且还有任务没有完成的时候
  while (!shouldYield && nextWorkOfUnit) {
    // 执行dom任务并且返回新任务
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = idleDeadline.timeRemaining() < 1;
  }
  requestIdleCallback(workLoop);
}
function performWorkOfUnit(fiber) {
  // 如果当前work没有dom，则进行下列三项操作
  if (!fiber.dom) {
    // 创建dom
    fiber.dom = createDOMNode(fiber.type);
    // 将dom挂载到父节点上
    fiber.parent.dom.append(fiber.dom);
    // 设置props
    updateProps(fiber.dom, fiber.props);
  }
  // 3.转换列表，设置指针
  genChildrenQueue(fiber);

  // 4.返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return fiber.parent.sibling;
}
// 根据类型创建dom节点
function createDOMNode(type) {
  const domNode =
    type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(type);
  return domNode;
}
// 给dom添加props
function updateProps(dom, props) {
  // 给dom添加上除了children之外的属性
  Reflect.ownKeys(props).forEach((key) => {
    switch (key) {
      // 处理样式obj
      case 'style':
        const styleObj = props.style;
        Object.keys(styleObj).forEach((styleKey) => {
          dom.style[styleKey] = styleObj[styleKey];
        });
        break;
      // 递归处理children
      case 'children':
        props.children.forEach((child) => {
          render(child, dom);
        });
        break;
      // 其他属性直接添加即可
      default:
        dom[key] = props[key];
        break;
    }
  });
}
// 将work的children构成的dom树转化成linkedList储存的队列，指向关系为前序遍历顺序
function genChildrenQueue(fiber) {
  // 当前work的所有children
  const children = fiber.props.children;
  // 上一次访问的child
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibling: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}
requestIdleCallback(workLoop);

const React = {
  render,
  createElement,
};
export default React;
