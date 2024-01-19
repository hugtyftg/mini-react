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
