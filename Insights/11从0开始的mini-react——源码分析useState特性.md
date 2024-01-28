注意：下文中的 setState 并不是指类组件中的 this.setState，而是 useState 返回的状态修改函数

# useState 特性解释

## 异步更新、批处理更新、updater 更新队列

## setState 沿着作用域查找闭包中的值

# 源码实现

## 基本结构

# 特性分析

## 异步批处理/更新队列机制

## 惰性初始化

## 闭包为什么导致直接传新值的 setState 多次连续更新失败？

## 传函数的 setState 为什么多次连续更新成功？

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
