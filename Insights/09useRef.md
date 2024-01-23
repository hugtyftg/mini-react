useRef 的实现相对来说比较简单，可以理解成“青春版 useState”，因为 ref 的更新并不会引起视图更新，这也就意味着，

1. 初始化阶段，initialize ref
2. 更新阶段，从 alternate 获取 ref 的旧值直接赋值，挂载到 Curren fiber 即可

需要注意的是，同 useState 一样，在设置/获取挂载在 fiber 上的 refHook 的时候，也需要 index，从 fiber.refHooks 中获取到正确对应的 refHook 对象。
因此，只能在最外层使用 useRef 而不能在条件判断时使用 useRef，不然 index 对不上会出现错误。

```js
let refHooks;
let refHookIndex;
function useRef(initial) {
  let currentFiber = wipFiber;
  let oldFiberRefHook = currentFiber.alternate?.refHooks[refHookIndex];
  let refHook = {
    current: oldFiberRefHook ? oldFiberRefHook.current : initial,
  };
  // 给wipFiber添加ref属性
  currentFiber.refHooks = refHooks;
  // 增加ref值
  refHooks.push(refHook);
  refHookIndex++;
  return refHook;
}
```

```js
// 处理函数组件
function handleFunctionComponent(fiber) {
  // 存储将来要更新的FC fiber
  wipFiber = fiber;
  // 初始化当前fiber在当前闭包中的stateHooks和对应的index
  stateHookIndex = 0;
  stateHooks = [];
  // 初始化副作用
  effectHooks = [];
  // 初始化refs
  refHooks = [];
  refHookIndex = 0;
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
```
