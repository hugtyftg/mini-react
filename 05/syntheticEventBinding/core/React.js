let root = null;
let nextWorkOfUnit = null;
// 主入口
function render(el, container) {
  nextWorkOfUnit = {
    type: '',
    dom: container,
    props: {
      children: [el],
    },
  };
  root = nextWorkOfUnit;
  requestIdleCallback(workLoop);
}
// 创建virtual dom
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return /^(string|number)/.test(typeof child)
          ? createTextNode(child)
          : child;
      }),
    },
  };
}
function createTextNode(nodeValue) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue,
      children: [],
    },
  };
}
// 根据类型创建真实dom
function createDOMNode(type) {
  const dom =
    type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(type);
  return dom;
}

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (root && !nextWorkOfUnit) {
    console.log('finished');
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
function commitRoot() {
  commitWork(root.child);
  root = null;
}
function commitWork(fiber) {
  // 终止条件
  if (!fiber) return;
  // 执行任务——添加节点
  let fiberParent = fiber.parent;
  // 对于非函数组件，一直向上找dom挂载
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  // function component fiber没有dom
  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
  }
  // 递
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
// 执行微任务队列
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';
  if (isFunctionComponent) {
    handleFunctionComponent(fiber);
  } else {
    handleHostComponent(fiber);
  }

  // 返回下一个fiber，注意可能有很多层，可能要向上找很多层parent
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
// 处理函数组件
function handleFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];
  initChildren(fiber, children);
}
// 处理普通元素
function handleHostComponent(fiber) {
  if (!fiber.dom) {
    // 1.创建node
    fiber.dom = createDOMNode(fiber.type);
    // 2.挂载dom不能在requestIdleCallback过程中进行，在所有任务执行完毕之后进行
    // fiber.parent.dom.append(fiber.dom);
    // 3.处理props
    updateProps(fiber.dom, fiber.props);
  }
  initChildren(fiber, fiber.props.children);
}
// 处理vdom的props
function updateProps(dom, props) {
  Reflect.ownKeys(props).forEach((propKey) => {
    switch (propKey) {
      case 'class':
        dom.className = props.class;
        break;
      case 'style':
        const styleObj = props.style;
        Object.keys(styleObj).forEach((styleKey) => {
          dom.style[styleKey] = styleObj[styleKey];
        });
        break;
      case 'children':
        return;
      default:
        if (propKey.startsWith('on')) {
          const eventName = propKey.toLowerCase().substring(2);
          dom.addEventListener(eventName, props[propKey]);
        } else {
          dom[propKey] = props[propKey];
        }
        break;
    }
  });
}
// 将DOM树按照前序遍历的顺序组织成链表
function initChildren(fiber, children) {
  console.log(fiber);
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
const React = {
  render,
  createElement,
};
export default React;
