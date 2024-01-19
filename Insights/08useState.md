为什么不能在 if 语句里面使用 useState

因为 stateHook 在更新时取值是根据索引取的，如果有 if 语句，则在初始渲染或者更新的某些时候无法执行 useState，导致 state 和 index 无法一一对应

useState 基本结构

```js
function useState(initial) {
  // state
  let stateHook = {
    state: initial,
  };
  function setState(action) {
    // 修改state
    stateHook.state = action(stateHook.state);
    // 给wipRoot重新赋值，推动requestIdleCallback(workLoop)重新生成一棵DOM树，从而更新视图
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  }
  return [stateHook.state, setState];
}
```

## 实现 action 为函数的 useState

但是这样做有一个问题，在初始渲染的时候调用了一次 useState，此时的 stateHook 值是 initial，setState 通过闭包拿到的 state 也是 initial

在下一次调用 setXXX、requestIdleCallback 开始工作、更新视图的时候，会再次执行当前的 FC 组件，在再次调用 useState，但是 state 的值还是 initial，因此视图无法更新。

如果想要视图更新，需要获取到当前 FC 的 fiber 在上一个时间片中的 state 值，据此更新视图

```js
function useState(initial) {
  // 使用闭包暂时存储这个useState所在的FC的fiber
  let currentFiber = wipFiber;
  // 通过alternate指针将两个闭包里面的fiber联系起来。
  let oldFiberHook = currentFiber.alternate?.stateHook;
  const stateHook = {
    state: oldFiberHook ? oldFiberHook.state : initial,
  };
  currentFiber.stateHook = stateHook;

  function setState(action) {
    // 给wipRoot赋值，开启创建新fiber的流程
    stateHook.state = action(stateHook.state);
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  }
  return [stateHook.state, setState];
}
```

对于初始化阶段，当 work 执行到 FC 对应的 fiber 的时候，执行 fiber.type(fiber.props)，也就是自上而下地执行了这个 FC 对应的函数。useState 第一次被执行，此时所有 fiber 都没有 alternate，因此 oldFiberHook 为 undefined，stateHook 赋值的时候采用初始值，当前 FC 所对应的老的 fiber 添加了 stateHook 属性，此时的闭包（函数执行期上下文）记作 EC1，产生的 setXXX 引用的变量也是在 EC1 内

在某个时刻调用 setXXX 之后，EC1 闭包中的 state 值被更新，wipRoot 被赋值，workLoop 自动开始执行。当再次执行到这个 FC 时，通过 fiber.type(fiber.props)又运行了一次 useState，这个时候创建出来了 EC2，state 通过 alternate 被更新为 FC fiber 的 EC1 中的值，也就是刚刚触发的 action 的对 state 的更新结果，并将 EC2 中的 state 返回给 FC，FC 中 jsx 引用的 state 也更新为 EC2 中的值。

EC2 返回的 setXXX 函数等待下一次调用它的时刻，重复着修改 EC2 state -> 重新构建 fiber 链表 -> 处理 FC -> fiber.type(fiber.props) -> 执行 useState -> 返回 EC3 的 setXXX -> ... 循环往复

一个 FC 存储多个 state

如果只是用一个变量保存的话，前面的 state 会被后面的 state 覆盖，所以需要使用数组存储一个 FC 内的所有 state。由于一个应用里面有很多个 FC，每个 FC 有很多个 state，第一反应是直接在全局使用一个二维数组保存每个 n FC \* m state，但是，每个 FC 想知道的仅仅是它自身在之前的 state，而不关心其他 FC，并且我们已经通过了上面的机制拿到了每个 FC 对应的闭包，所以使用庞大的二维表是完全没有必要的，应该在全局声明 stateHooks 和 stateHookIndex 两个变量，在每个 FC 对应的 fiber 闭包中初始化赋值为[]和 0

```js
// 处理函数组件
function handleFunctionComponent(fiber) {
  // 存储将来要更新的FC fiber
  wipFiber = fiber;
  // 初始化当前fiber在当前闭包中的stateHooks和对应的index
  stateHookIndex = 0;
  stateHooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```

```js
// 会在处理每个FC的时候赋初始值，而不是直接全局化为一张大的二维表
let stateHooks;
let stateHookIndex;
function useState(initial) {
  // 使用闭包暂时存储要改变的fiber，也就是这个useState所在的FC的fiber
  let currentFiber = wipFiber;
  // 通过alternate指针将两个闭包里面的fiber联系起来
  let oldFiberHook = currentFiber.alternate?.stateHooks[stateHookIndex];
  // 确定当前state
  const stateHook = {
    state: oldFiberHook ? oldFiberHook.state : initial,
    // 当前state的action更新队列
  };
  currentFiber.stateHooks = stateHooks;
  // 更新当前fiber的stateHooks
  stateHooks.push(stateHook);
  stateHookIndex++;

  function setState(action) {
    stateHook.state = action(stateHook.state);
    // 给wipRoot赋值，开启创建新fiber的流程
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  }
  return [stateHook.state, setState];
}
```

# useState 的批处理机制实现【异步更新队列】

上面的逻辑其实有一个很怪的点——setState 的时候，拿到了老 EC 闭包中的值，直接同步更新老的值，然后开始重新构建 DOM 树和 fiber 链表，再次进入 FC 函数，在第二次调用 FC 产生的闭包里面再次执行 useState 的时候，**从老 EC 里面拿新值**，这样非常不合理，为什么不能在**新 EC 里面通过老 EC 的旧值算出新值**呢，并且这样的同步修改方式在大量 setState 的时候，明明只需要最终更新一次视图，却因为中间产生了若干中间值而进行了多次不必要的更新。

解决方法：不同步更新，将所有 action 收集起来放到 updaterQueue 里面，在调用 setState 后再次进入 FC 的 useState 闭包时批量调用，调用完成之后才更新视图。视图只更新一次，提高更新效率

```js
// 会在处理每个FC的时候赋初始值，而不是直接全局化为一张大的二维表
let stateHooks;
let stateHookIndex;
function useState(initial) {
  // 使用闭包暂时存储要改变的fiber，也就是这个useState所在的FC的fiber
  let currentFiber = wipFiber;
  // 通过alternate指针将两个闭包里面的fiber联系起来
  let oldFiberHook = currentFiber.alternate?.stateHooks[stateHookIndex];
  // 确定当前state
  const stateHook = {
    state: oldFiberHook ? oldFiberHook.state : initial,
    // 当前state的action更新队列
    updateQueue: oldFiberHook ? oldFiberHook.updateQueue : [],
  };

  // 批处理更新当前action的更新队列
  stateHook.updateQueue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });
  // 更新完毕之后应该重置更新队列，不然action会一直累积
  stateHook.updateQueue = [];

  currentFiber.stateHooks = stateHooks;

  // 更新当前fiber的stateHooks
  stateHooks.push(stateHook);
  stateHookIndex++;

  function setState(action) {
    // stateHook.state = action(stateHook.state);
    // 不应该咋setState里面更新state，而是应该在setState引起的下一次FC调用、生成闭包的时候，批处理更新函数
    stateHook.updateQueue.push(action); // 支持传入值和传入函数

    // 给wipRoot赋值，开启创建新fiber的流程
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  }
  return [stateHook.state, setState];
}
```

## 支持直接传入新值而不是函数

传入函数和传入值的区别就在于，更新的时候是调用函数还是直接使用值，根据 action 的 type 判断即可，对于值用一个函数包装

```js
// 支持传入值和传入函数
stateHook.updateQueue.push(
  typeof action === 'function' ? action : () => action
);
```

# 提前检测，减少不必要的更新（类似 Object.is 的浅比较）

提前浅比较检测是否需要更新，如果 primitive value 相等或者引用了同一段内存地址的 reference type，则不进行更新

```js
const eagerState =
  typeof action === 'function' ? action(stateHook.state) : action;
if (Object.is(eagerState, stateHook.state)) {
  return;
}
```
