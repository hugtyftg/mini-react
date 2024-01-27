import { Fiber, VNodeType, VirtualDOM } from './types';
import { TEXT_ELEMENT } from './types/constants';
// 当前正在活动的root working in progress
let wipRoot: Fiber | null = null;
// 传入performWorkOfUnit函数的工作单元
let nextWorkOfUnit: Fiber | null = null;
// fiber队列执行过程中“打的断点”，用于执行过程中标识跟踪FC fiber
let wipFiber: Fiber | null = null;
// 在统一提交挂载dom之前，先把更新后没有的fiber dom统一删除
let deletions: Fiber[] = [];
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
    alternate: null,
    effectTag: 'placement',
  };
  nextWorkOfUnit = wipRoot;
}
// 更新
function update() {
  // update所在的FC fiber
  let currentFiber: Fiber | null = wipFiber;
  return () => {
    // 从update所在的fiber开始更新
    wipRoot = {
      ...(currentFiber as Fiber),
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
}
function createDOMNode(type: string): HTMLElement | Text {
  return type === TEXT_ELEMENT
    ? document.createTextNode('')
    : document.createElement(type);
}
// 更新props
function updateProps(dom: HTMLElement | Text, nextProps: any, prevProps: any) {
  // 3中情况：
  // 1.旧有，新无
  // 2.旧无，新有
  // 3.旧有，新有，值不同
  // 其中后两种可以归结为同一种情况，分别遍历一次新旧props即可（旧无也就是取值结果是undefined）
  Object.keys(prevProps).forEach((prevPropKey: string) => {
    if (prevPropKey !== 'children') {
      if (!(prevPropKey in nextProps)) {
        (dom as HTMLElement).removeAttribute(prevPropKey);
      }
    }
  });
  Object.keys(nextProps).forEach((nextPropKey: string) => {
    if (nextPropKey !== 'children') {
      if (nextProps[nextPropKey] !== prevProps[nextPropKey]) {
        if (nextPropKey === 'style') {
          const styleObj = nextProps.style;
          Object.keys(styleObj).forEach((styleKey: string) => {
            (dom as HTMLElement).style[styleKey] = styleObj[styleKey];
          });
        } else if (nextPropKey.startsWith('on')) {
          const eventName: string = nextPropKey.slice(2).toLowerCase();
          (dom as HTMLElement).removeEventListener(
            eventName,
            prevProps[nextPropKey]
          );
          (dom as HTMLElement).addEventListener(
            eventName,
            nextProps[nextPropKey]
          );
        } else {
          dom[nextPropKey] = nextProps[nextPropKey];
        }
      }
    }
  });
}
function reconcileChildren(fiber: Fiber, children: Array<VirtualDOM>) {
  // 当前fiber对应的oldFiber的第一个child，在更新阶段为新旧child建立alternate关系
  let oldFiberChild: Fiber | null | undefined = fiber.alternate?.child;
  // 当目前处理的child不是fiber的第一个孩子时，借助这个指针将上一个child与当前child建立sibling关系
  let prevChildFiber: null | Fiber = null;
  children.forEach((child: VirtualDOM, index: number) => {
    let newFiber: Fiber | null;
    const isSameType = oldFiberChild && child.type === oldFiberChild?.type;

    // 根据旧child fiber是否存在以及存在时新旧类型对比，区分三种情况：
    // 1.更新，dom结构没有变化，仅仅是prop变化
    // 2.初始化，新建fiber和dom
    // 3.更新，dom结构发生变化。又分为两种情况：children等数量和不等数量，即fiber链等长和不等长
    // 使用effectTag标记当前fiber用于初始化渲染还是更新阶段，在统一提交阶段分情况处理
    if (isSameType) {
      // 仅prop更新，oldFiberChild一定不为空
      if (!oldFiberChild) return;
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
      // 初始化
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibling: null,
          dom: null,
          alternate: null,
          effectTag: 'placement',
        };
      } else {
        // child可能为false，此时不应该显示内容
        newFiber = null;
      }
      // 如果前后类型不同并且oldFiberChild不为空，说明不是初始化阶段，而是有dom变化的更新
      if (oldFiberChild) {
        deletions.push(oldFiberChild);
      }
    }
    // 对于更新阶段，oldFiberChild也要向下迭代
    if (oldFiberChild) {
      oldFiberChild = oldFiberChild.sibling;
    }
    // 没有false时，index为0标识为child
    // 如果本身index不为0并且index 0元素为false，那么就需要判断prevChildFiber是否为null
    if (index === 0 || !prevChildFiber) {
      fiber.child = newFiber;
    } else {
      // index为0时为空
      // 连续的几个child都为false时
      // 由于后面几行给prevChildFiber赋值前考虑newFiber是否为空（即当前处理的child是否为false）
      // 因此prevChild会一直为空，导致null.sibling报错，因此需要判断prevChildFiber是否为空
      if (prevChildFiber) {
        prevChildFiber.sibling = newFiber;
      }
    }
    // 指针向下移动，使得第2、3、4等child可以和前一个child建立sibling关系
    // 在所有children处理完毕之后，prevChildFiber指向最后一个child fiber
    // child可能为false，此时newFiber为null，prevChildFiber没有必要移动到flase 对应的null fiber
    if (newFiber) {
      prevChildFiber = newFiber;
    }
  });
  // 遍历一遍新DOM树之后再检查一遍，老的DOM树上是否还有fiber，如果有，说明这是老的children多余的若干个节点，需要移除
  while (oldFiberChild) {
    deletions.push(oldFiberChild);
    oldFiberChild = oldFiberChild.sibling;
  }
}
function workLoop(deadline: any) {
  let shouldYield = false;
  // 有剩余时间并且还有需要执行的任务时，循环处理任务
  while (!shouldYield && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    // 某个FC内调用update函数触发针对该函数的更新，不涉及其他函数组件的重新计算
    // wipFiber -> currentFiber -> wipRoot代表的FC fiber是更新的开始点，
    // wipRoot的sibling FC fiber是当前更新的终点
    // 如果下一个要执行的任务是本次更新的终点，将nextWorkOfUnit置空，结束创建新的fiber队列
    // 需要考虑的是，对于初始化渲染阶段，wipRoot.sibling始终为空，因为root是这棵dom树的唯一的根，防止报错需要添加可选链
    if (nextWorkOfUnit?.type === (wipRoot as Fiber).sibling?.type) {
      nextWorkOfUnit = null;
    }
    shouldYield = deadline.timeRemaining() < 1;
  }
  // 任务提交完毕时统一提交 一次 ，执行以后就把wipRoot复原
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
// 普通组件在没有dom的时候需要创建dom和更新props，并且迭代处理children
function handleHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDOMNode(fiber.type as string);
    updateProps(fiber.dom, fiber.props, {});
  }
  // 处理children，并且添加child -> sibling ->
  reconcileChildren(fiber, fiber.props.children);
}
// 函数组件无需创建dom，只需要递归处理children
function handleFunctionComponent(fiber: Fiber) {
  if (typeof fiber.type !== 'function') return;
  // wipFiber实时指向FC
  wipFiber = fiber;
  const children: Fiber[] = [fiber.type(fiber.props)];
  // 处理children，并且添加child -> sibling -> uncle
  reconcileChildren(fiber, children);
}
// 执行fiber
function performWorkOfUnit(fiber: Fiber | null) {
  // 要处理的fiber不应该为空，为空的时候直接返回null
  if (fiber) {
    if (typeof fiber.type === 'string') {
      handleHostComponent(fiber);
    } else {
      handleFunctionComponent(fiber);
    }
    if (fiber.child) {
      return fiber.child;
    }
    // 4.返回下一个
    // 有child优先返回child
    // 没有child则返回sibling
    // 没有sibling则返回叔叔
    // 如果当前进入的层级过深，需要向上找祖父甚至曾祖父的兄弟
    let nextFiber: Fiber | null = fiber;
    // 1.创建dom（除去container fiber有dom）
    // 2.添加props
    while (nextFiber) {
      if (nextFiber.sibling) {
        return nextFiber.sibling;
      }
      nextFiber = nextFiber.parent;
    }
  }
  // 如果任务已经执行完毕，即使向上一直找，也最终会停在root fiber，其parent为null，跳出循环，返回null终止工作
  return null;
}
function commitRoot() {
  // 把更新后没有的fiber dom统一删除
  deletions.forEach(commitDeletion);
  // 统一提交挂载dom
  commitWork((wipRoot as Fiber).child);
  // 重置当前活动的fiber
  wipRoot = null;
  // 重置需要删除的fiber
  // 没有清空的话会导致在之后的更新时仍然执行之前更新需要删除的fiber dom，
  // 但是这个fiber dom很可能已经不挂载在原来的parentFiber.dom上了，因此会在remove时报错
  deletions = [];
}
function commitWork(fiber: Fiber | null) {
  // 出口
  if (!fiber) {
    return;
  }
  // 任务 挂载
  // 支持FC后需要考虑两个问题
  // 1.fiber.parent为FC，没有dom——一直向上找dom挂载
  // 2.fiber为FC，没有dom——跳过挂载，直接处理child
  // 需要考虑两个阶段：初始化和更新
  if (fiber.dom) {
    let fiberParent: Fiber = fiber.parent as Fiber;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent as Fiber;
    }
    if (fiber.effectTag === 'update') {
      // 更新props
      updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
    } else {
      // 初始化
      fiberParent.dom.appendChild(fiber.dom);
    }
  }
  // 递
  commitWork((fiber as Fiber).child);
  commitWork((fiber as Fiber).sibling);
}
// 在统一提交挂载dom之前，先把更新后没有的fiber dom统一删除
function commitDeletion(fiber: Fiber) {
  if (fiber.dom) {
    // fiber.parent可能为FC fiber没有dom，应该向上查找祖父等
    let parentFiber: Fiber | null = fiber.parent;
    while (!parentFiber?.dom) {
      parentFiber = (parentFiber as Fiber).parent;
    }

    parentFiber.dom.removeChild(fiber.dom);
  } else {
    // fiber为FC fiber没有dom，应该删除child fiber dom
    commitDeletion(fiber.child as Fiber);
  }
}
requestIdleCallback(workLoop);

const React = {
  createElement,
  render,
  update,
};
export default React;
