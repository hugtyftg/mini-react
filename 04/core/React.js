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
  commitWork(root);
  root = null;
}
function commitWork(fiber) {
  // 终止条件
  if (!fiber) {
    // 归
    return;
  }
  // 执行任务
  if (fiber.parent) fiber.parent.dom.append(fiber.dom);
  // 递
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
// 执行微任务队列
function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    // 1.创建node
    fiber.dom = createDOMNode(fiber.type);
    // 2.挂载dom
    // fiber.parent.dom.append(fiber.dom);
    // 3.处理props
    updateProps(fiber.dom, fiber.props);
  }
  initChildren(fiber);

  // 返回下一个fiber，注意可能有很多层，可能要向上找很多层parent
  if (fiber.child) {
    return fiber.child;
  }
  if (fiber.sibling) {
    return fiber.sibling;
  }
  return fiber.parent.sibling;
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
        dom[propKey] = props[propKey];
        break;
    }
  });
}
// 将DOM树按照前序遍历的顺序组织成链表
function initChildren(fiber) {
  let prevChild = null;
  fiber.props.children.forEach((child, index) => {
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

// let root = undefined;
// let nextUnitOfWork = undefined;

// function createTextNode(text) {
//   return {
//     type: 'TEXT_ELEMENT',
//     props: {
//       nodeValue: text,
//       children: [],
//     },
//   };
// }

// function createElement(type, props, ...children) {
//   return {
//     type,
//     props: {
//       ...props,
//       children: children.map((child) => {
//         const isTextNode =
//           typeof child === 'string' || typeof child === 'number';
//         return isTextNode ? createTextNode(child) : child;
//       }),
//     },
//   };
// }

// function workLoop(deadline) {
//   let shouldYield = false;

//   while (nextUnitOfWork && !shouldYield) {
//     nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
//     shouldYield = deadline.timeRemaining() < 1;
//   }

//   if (!nextUnitOfWork && root) {
//     commitRoot();
//   }

//   requestIdleCallback(workLoop);
// }

// function commitRoot() {
//   commitWork(root.child);
//   console.log(root);
//   root = undefined;
// }

// function commitWork(fiber) {
//   if (!fiber) return;

//   let fiberParent = fiber.parent;
//   while (fiberParent && !fiberParent.dom) {
//     fiberParent = fiberParent.parent;
//   }

//   if (fiber.dom) {
//     fiberParent.dom.append(fiber.dom);
//   }

//   commitWork(fiber.child);
//   commitWork(fiber.sibling);
// }

// function createDom(type) {
//   return type === 'TEXT_ELEMENT'
//     ? document.createTextNode('')
//     : document.createElement(type);
// }

// function updateProps(dom, props) {
//   Object.keys(props).forEach((key) => {
//     if (key === 'children') return;
//     // @ts-ignore
//     dom[key] = props[key];
//   });
// }

// function initChildren(fiber, children) {
//   let prevUnitOfWork = undefined;
//   children.forEach((child, idx) => {
//     const unitOfWork = {
//       type: child.type,
//       props: child.props,
//       parent: fiber,
//     };

//     if (idx === 0) {
//       fiber.child = unitOfWork;
//     } else {
//       prevUnitOfWork.sibling = unitOfWork;
//     }

//     if (idx === children.length - 1) {
//       unitOfWork.uncle = fiber.sibling || fiber.uncle;
//     }

//     prevUnitOfWork = unitOfWork;
//   });
// }

// function updateFunctionComponent(fiber) {
//   const children = [fiber.type(fiber.props)];
//   initChildren(fiber, children);
// }

// function updateHostComponent(fiber) {
//   const dom = (fiber.dom = fiber.dom || createDom(fiber.type));
//   updateProps(dom, fiber.props);
//   initChildren(fiber, fiber.props.children);
// }

// function performUnitOfWork(fiber) {
//   const isFunctionComponent = typeof fiber.type === 'function';

//   if (isFunctionComponent) {
//     updateFunctionComponent(fiber);
//   } else {
//     updateHostComponent(fiber);
//   }

//   return fiber.child || fiber.sibling || fiber.uncle;
// }

// export function render(el, container) {
//   nextUnitOfWork = {
//     type: '',
//     props: {
//       children: [el],
//     },
//     dom: container,
//   };

//   root = nextUnitOfWork;
//   requestIdleCallback(workLoop);
// }

// const React = {
//   render,
//   createElement,
// };

// export default React;
