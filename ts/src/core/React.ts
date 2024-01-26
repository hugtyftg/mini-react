import { Fiber, VNodeType, VirtualDOM } from './types';
import { TEXT_ELEMENT } from './types/constants';
// 当前正在活动的root working in progress
let wipRoot: Fiber | null = null;
let nextWorkOfUnit: Fiber | null = null;

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
  wipRoot = {
    type: el.type,
    props: {
      ...el.props,
    },
    dom: container,
    parent: null,
    child: null,
    sibling: null,
  };
  nextWorkOfUnit = wipRoot;
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
function initChildren(fiber: Fiber | null, children: Array<VirtualDOM>) {
  // 当目前处理的child不是fiber的第一个孩子时，借助这个指针将上一个child与当前child建立sibling关系
  let prevChildFiber: null | Fiber = null;
  children.forEach((child: VirtualDOM, index: number) => {
    let newFiber: Fiber = {
      type: child.type,
      props: child.props,
      dom: null,
      parent: fiber,
      child: null,
      sibling: null,
    };
    if (index === 0) {
      (fiber as Fiber).child = newFiber;
    } else {
      (prevChildFiber as Fiber).sibling = newFiber;
    }
    prevChildFiber = newFiber;
  });
}
function workLoop(deadline: any) {
  let shouldYield = false;
  // 有剩余时间并且还有需要执行的任务时，循环处理任务
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 任务提交完毕时统一提交 一次 ，执行以后就把wipRoot复原
  if (!nextWorkOfUnit && wipRoot) {
    console.log('commit');

    commitRoot();
    wipRoot = null;
  }
  requestIdleCallback(workLoop);
}
// 执行fiber
function performWorkOfUnit(fiber: Fiber | null) {
  // 1.创建dom（除去container fiber有dom）
  // 2.添加props
  if (fiber && !fiber.dom) {
    fiber.dom = createDOMNode(fiber.type);
    updateProps(fiber.dom, fiber.props);
  }
  // 3.处理children，并且添加child -> sibling ->
  initChildren(fiber, (fiber as Fiber).props.children);
  // 4.返回下一个
  // 有child优先返回child
  if ((fiber as Fiber).child) {
    return (fiber as Fiber).child;
  }
  // 没有child则返回sibling
  // 没有sibling则返回叔叔
  // 如果当前进入的层级过深，需要向上找祖父甚至曾祖父的兄弟
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  // 如果任务已经执行完毕，即使向上一直找，也最终会停在root fiber，其parent为null，跳出循环，返回null终止工作
  return null;
}
function commitRoot() {
  commitWork((wipRoot as Fiber).child);
  wipRoot = null;
}
function commitWork(fiber: Fiber | null) {
  // 出口
  if (!fiber) {
    return;
  }
  console.log(fiber);

  // 任务 挂载
  // 支持FC后需要考虑两个问题
  // 1.fiber.parent为FC，没有dom——一直向上找dom挂载
  // 2.fiber为FC，没有dom——跳过挂载，直接处理child
  if (fiber.dom) {
    let fiberParent: Fiber = fiber.parent as Fiber;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent as Fiber;
    }
    fiber.parent?.dom?.appendChild(fiber.dom);
  }
  // 递
  commitWork((fiber as Fiber).child);
  commitWork((fiber as Fiber).sibling);
}
requestIdleCallback(workLoop);
const React = {
  createElement,
  render,
};
export default React;
