注意：下文中的 setState 并不是指类组件中的 this.setState，而是 useState 返回的状态修改函数

# useState 特性解释

## 异步更新、批处理更新、updater 更新队列

### 异步更新、批处理更新、updater 更新队列是什么

某一个函数组件中多次调用 setState 并不会立即引起视图多次重新计算渲染绘制，而是将这些 setState 存入 updater 更新队列中，在页面剩余任务执行完毕之后一次执行所有的 setState，减少不必要的视图更新

### 源码分析

所有 setState 在调用之后不会立刻修改状态、更新视图，而是统一被收集到当前 FC fiber 的 stateHooks 内，成为一个更新队列。在新的 fiber 构建完、再次执行到这个 FC fiber 的时候，又会执行 useState 创建新的闭包，在这时才批处理更新、执行更新队列里的所有 action。传入的 action 有两种——直接传值和传带参函数，直接传值同样会被包裹成一个返回该值的 action。批处理更新、依次执行 action 的时候，如果传入了一个值，无论执行多少次，state 总是被重复更改成了这个值；而如果传入的是一个 action，每次都是基于上一个 state 计算得到下一个 state，所以可以连续修改值。

## 惰性初始化

state 的获取方式：查看当前 fiber.alternate 是否有值，若无值说明是初始化渲染阶段，state 应该被初始化成 initial value，如果当前的 initial value 是一个函数，那就运行该函数使用返回值初始化 state。若有值说明是后续的更新阶段，先通过 fiber.alternate 取得上次的 state，再依次执行所有 action 得到新 state。

## 闭包为什么导致直接传新值的 setState 多次连续更新失败？传函数的 setState 为什么多次连续更新成功？

react 应用构建 fiber 任务队列的过程中，在执行到某个 FC fiber 的时候，通过 fiber.type(fiber.props)执行函数从而得到这个函数组件盒子实际包裹的 UI 内容。在执行函数的过程中碰到 useState 并执行它，返回 state 和一个修改 state 的 setState 函数。

首先，一旦调用 setState 就会给 wipRoot 赋值，重新开启监听浏览器空闲时间、创建新 fiber 的工作流，即使多次调用 setState，传入的 wipRoot 其实都是同一个值，都是由当前 FC fiber 解构得到的，一旦第一次调用 setState 让 wipRoot 不为空，构建工作流就已经开始运行了，后面再调用 setState 对工作流也没有什么实际的影响，因此**可以理解成多次 setState 最终只导致了一次更新**。

其次，在调用 setState 的时候有两种传参方式——直接传值和传带参函数，前者也会被包裹成一个函数`() => action`。在 setState 调用后构建新 fiber 的过程中，再次执行到当前 FC fiber、运行 fiber.type(fiber.props)、运行 useState 时，依次执行该 fiber stateHooks 的所有 action。所以如果传入了一个值，无论执行多少次，state 总是被重复更改成了这个值；而如果传入的是一个 action，每次都是基于上一个 state 计算得到下一个 state，所以可以连续修改值。

```js
stateHook.updateQueue.forEach((action: Function) => {
  stateHook.state = action(stateHook.state);
});
```

## 为什么要一直重新挂载 stateHooks？

目前视图的更新是由 setState 引起的，并且为了保证视图更新的效率最高，我们只会重新计算和渲染 setState 所在的函数组件，换句话说，开始更新的起点是在运行过程中通过 wipFiber 保存的 FC fiber，开始更新的终点是 FC fiber 的最后一个节点，也就是 FC fiber 的 sibling。

执行 setState、重新填充 wipRoot 的时候，是直接解构的 currentFiber，也就是上一个闭包中的 wipFiber，stateHooks 是原封不动的。fiber 队列从当前函数组件开始生成、执行，再次执行当前 FC，currentFiber 是当前闭包里的 wipFiber，而当前闭包里的 wipFiber 是 setState 时 通过解构上一个 currentFiber 得到的 wipRoot。兜兜转转，该 FC 的 currentFiber 始终是这一个 fiber，因此在更新阶段再次执行 useState 时，currentFiber.stateHooks 并不为空，它是上一个闭包的 stateHooks，所以需要直接覆盖

```js
// 给当前新创建出来的fiber重置stateHooks
currentFiber.stateHooks = stateHooks;
// 不能写成
// if (!currentFiber.stateHooks) {
// currentFiber.stateHooks = stateHooks;
// }
```
