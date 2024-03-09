## useMemo 使用方式

```js
const memorizedValue = React.useMemo(callback[, deps]);
```

- callback：初始化时会调用一次 callback 将返回的结果作为 memorized value 保存

- deps：依赖数组，初始化之后仅当依赖数组中任意一项发生变化时，会重新调用 callback 更新 memorizedValue

## 实现思路

### 预备工作

和 useState 和 useRef 等 hooks 相似，在 fiber 上添加 memoHooks 数组，里面保存着若干 memoHook，顺序和 function component 中注册使用 useMemo 的顺序相同，因此处理每个 function component 的 fiber 时都要初始化 memoHooks 和标识顺序的 memoHooksIndex

```js
// 某个fiber的所有memo hooks
let memoHooks: MemoHook<any, any>[];
// 标识某个memo hook在其fiber memo hooks所处的索引位置（从上到下执行function component的时候会遇到很多个useMemo，是有顺序的）
let memoHooksIndex: number;
...
function handleFunctionComponent(fiber: Fiber) {
  if (typeof fiber.type !== 'function') return;
  // wipFiber实时指向FC
  wipFiber = fiber;
  // 初始化该fiber的state相关的变量
  stateHooks = [];
  stateHookIndex = 0;
  // 初始化该fiber的ref相关的变量
  refHooks = [];
  refHookIndex = 0;
  // 初始化该fiber的ref相关的变量
  effectHooks = [];
  // 初始化该fiber的memo相关的变量
  memoHooks = [];
  memoHooksIndex = 0;
  const children: Fiber[] = [fiber.type(fiber.props)];
  // 处理children，并且添加child -> sibling -> uncle
  reconcileChildren(fiber, children);
}
```

### 正式处理

useMemo 被调用的时候也分为两个阶段：

1. 初始化阶段，直接调用 callback 将得到的值缓存

2. 更新阶段，deps 数组中的任一项发生变化时候重新调用 callback 更新缓存

因此问题显而易见：

- 获取当前 memoHook：memoHooksIndex 和 useMemo 在 function component 中的出现顺序一致

- 区分是否为初始化阶段：currentFiber.alternate 是否为空。

  - 对于初始化阶段，直接用 callback 执行结果作为缓存值

  - 对于更新阶段 👇

- 更新阶段是否有 dep 发生变化：通过 some 逐一对比新旧 fiber 当前 memoHook.deps 是否相同

  - 若未发生变化，则使用 oldMemoHook 的 memorizedValue

  - 若发生变化，则重新调用 callback 更新缓存值

最后不要忘记给当前 fiber 挂载 memoHooks 属性，并且顺延索引

## 实现

```js
function useMemo<T, K>(callback: () => T, deps: K[]): T {
  // 当前useEffecg所在的FC fiber
  let currentFiber: Fiber = wipFiber as Fiber;
  let oldMemoHook: MemoHook<T, K> | undefined =
    currentFiber.alternate?.memoHooks![memoHooksIndex];
  let memoHook: MemoHook<T, K>;
  if (oldMemoHook) {
    // update
    // 任意一个依赖项的值发生变化都要重新计算缓存值
    const needUpdate: boolean = deps.some((dep: K, index: number) => {
      return !Object.is(dep, oldMemoHook?.deps[index]);
    });
    if (needUpdate) {
      memoHook = {
        memorizedValue: callback(),
        deps,
      };
    } else {
      memoHook = {
        memorizedValue: oldMemoHook.memorizedValue,
        deps,
      };
    }
  } else {
    // init
    memoHook = {
      memorizedValue: callback(),
      deps,
    };
  }
  // 挂载到当前的新fiber上
  currentFiber.memoHooks = memoHooks;
  memoHooks.push(memoHook);
  memoHooksIndex++;
  return memoHook.memorizedValue;
}
```
