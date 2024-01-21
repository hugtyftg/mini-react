// 更新时使用
let currentRoot = null;
// work in progress指向根容器对应的链表节点的指针
let wipRoot = null;
let nextWorkOfUnit = null;
// 更新时候需要删除的节点
let deletions = [];
// 当前活动更新的fiber，也就是一个fc
let wipFiber = null;
// 开启循环监听浏览器空闲时间
requestIdleCallback(workLoop);
// 主入口
function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };
  nextWorkOfUnit = wipRoot;
}
// 暂时只考虑没有dom的增删，只有props的变化
function update() {
  // 使用闭包暂时存储要改变的fiber
  let currentFiber = wipFiber;
  return () => {
    // 更新开始的地方
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
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
          : child; // 如果是false的话，直接放在children数组里面
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

    // 在更新阶段，wipRoot是更新的开始点
    // 如果是，则更新停止
    // 需要考虑的是这些值可能为undefined，防止报错需要添加可选链
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = undefined;
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (wipRoot && !nextWorkOfUnit) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  // 重置当前活动的fiber
  wipRoot = null;
  // 重置需要删除的fiber
  deletions = [];
}
function commitDeletion(fiber) {
  if (fiber.dom) {
    // 如果当前fiber是FC child，父fiber没有dom，就一直向上找
    let parentFiber = fiber.parent;
    while (!parentFiber.dom) {
      parentFiber = parentFiber.parent;
    }
    parentFiber.dom.removeChild(fiber.dom);
  } else {
    // 如果当前fiber没有dom，说明是FC，删除它的child即可
    commitDeletion(fiber.child);
  }
}
function commitWork(fiber) {
  // 终止条件
  if (!fiber) return;
  // 执行任务
  // 添加节点
  let fiberParent = fiber.parent;
  // 对于非函数组件，一直向上找dom挂载
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  // 执行的任务有两种——更新和添加
  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === 'placement') {
    // function component fiber没有dom
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
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
  // 存储将来要更新的FC fiber
  wipFiber = fiber;
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
// 处理普通元素
function handleHostComponent(fiber) {
  if (!fiber.dom) {
    // 1.创建node
    fiber.dom = createDOMNode(fiber.type);
    // 2.挂载dom不能在requestIdleCallback过程中进行，在所有任务执行完毕之后进行
    // fiber.parent.dom.append(fiber.dom);
    // 3.处理props
    updateProps(fiber.dom, fiber.props, {});
  }
  reconcileChildren(fiber, fiber.props.children);
}
// 处理vdom的props
function updateProps(dom, nextProps, prevProps) {
  /* 1.old有 new没有 删除 */
  Object.keys(prevProps).forEach((propKey) => {
    if (propKey !== 'children') {
      if (!(propKey in nextProps)) {
        dom.removeAttribute(propKey);
      }
    }
  });
  /* 
    2.new有 old没有 添加
    3.new有 old有 值不同 更新
  */
  Object.keys(nextProps).forEach((propKey) => {
    if (propKey !== 'children') {
      if (nextProps[propKey] !== prevProps[propKey]) {
        if (propKey.startsWith('on')) {
          const eventType = propKey.toLowerCase().substring(2);
          dom.removeEventListener(eventType, prevProps[propKey]);
          dom.addEventListener(eventType, nextProps[propKey]);
        } else if (propKey === 'style') {
          const styleObj = nextProps.style;
          Object.keys(styleObj).forEach((styleKey) => {
            dom.style[styleKey] = styleObj[styleKey];
          });
        } else {
          dom[propKey] = nextProps[propKey];
        }
      }
    }
  });
}
// 将DOM树按照前序遍历的顺序组织成链表
function reconcileChildren(fiber, children) {
  // 如果是处于update阶段，获取当前fiber的alternate的child
  let oldFiberChild = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    let newFiber;
    const isSameType = oldFiberChild && child.type === oldFiberChild?.type;
    // 创建dom树分为两种情况——初始化创建和更新时候的创建
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibling: null,
        dom: oldFiberChild.dom,
        alternate: oldFiberChild,
        effectTag: 'update',
      };
    } else {
      if (child) {
        // add
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          effectTag: 'placement',
        };
      }
      // 如果新旧节点类型不同且odlFiberChild不为空，说明是children等长的更新阶段
      if (oldFiberChild) {
        deletions.push(oldFiberChild);
      }
    }
    // 更新阶段oldFiberChild
    if (oldFiberChild) {
      oldFiberChild = oldFiberChild.sibling;
    }
    // 当前fiber指向新fiber
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    // 指针同步移动
    // 如果child为false，则没有对应的fiber
    if (newFiber) {
      prevChild = newFiber;
    }
  });
  // 遍历一遍新DOM树之后再检查一遍，老的DOM树上是否还有fiber，如果有，说明这是老的children多余的若干个节点，需要移除
  while (oldFiberChild) {
    deletions.push(oldFiberChild);
    oldFiberChild = oldFiberChild.sibling;
  }
}

function handleSyntheticEvent(syntheticEventType) {
  let isCapture;
  let eventType = syntheticEventType.toLowerCase().substring(2);
  if (syntheticEventType.endsWith('Capture')) {
    eventType = eventType.substring(0, eventType.length - 7); // 事件名字去掉capture
    isCapture = true;
  }
  if (isCapture) {
    // 捕获阶段的绑定
    rootContainerDOM.addEventListener(
      eventType,
      (e) => {
        let path = e.composedPath();
        [...path].reverse().forEach((ele) => {
          let handler = ele.props[syntheticEventType];
          if (handler) {
            handler(e);
          }
        });
      },
      true
    );
  } else {
    // 冒泡阶段的绑定
    rootContainerDOM.addEventListener(
      eventType,
      (e) => {
        let path = e.composedPath();
        [...path].forEach((ele) => {
          let handler = ele.props[syntheticEventType];
          if (handler) {
            handler(e);
          }
        });
      },
      false
    );
  }
}
const React = {
  render,
  update,
  createElement,
};
export default React;
