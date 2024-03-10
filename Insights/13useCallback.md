## useCallback 使用方式

```js
const memorizedCallback = React.useCallback(callback[, deps]);
```

- callback：初始化时会将 callback 作为 memorized callback 缓存

- deps：依赖数组，初始化之后仅当依赖数组中任意一项发生变化时，会用新的 callback 更新 memorizedCallback

通常来说，useMemo、useCallback 会和 React.memo 配合使用，解决父组件更新引起的子组件不必要的更新（父组件传递给子组件的 props 的值或方法并没有发生地址变化，分别对应 useMemo 和 useCallback）

## 实现思路

可以利用 useMemo 的实现逻辑，缓存一个函数等同于缓存一个函数

## 实现

```js
function useCallback<T, K>(callback: T, deps: K[]) {
  // https://react.docschina.org/reference/react/useCallback#how-is-usecallback-related-to-usememo
  return useMemo(() => callback, deps);
}
```
