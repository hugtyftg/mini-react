# 收获

## 1.vite 通过 esbuild 识别并处理 jsx 语法

将文件扩展名更改成 jsx 并且引入我们实现的 react 之后，vite 会自动调用本地 react 中的 createElement 函数，将 jsx 元素直接转换成 createElement 语法，但是由于我们实现的 react 还不支持 function component 语法，所以 App 目前只能是一个 object

## 2.对于非常庞大的 DOM 树，render 时的问题和原因分析

问题：浏览器渲染卡顿

原因分析：render 处理子节点时采用的策略是递归，也就是基于递归实现的多叉树的深度优先的前序遍历

（1）从空间复杂度来讲，递归对于内存的消耗是毫无疑问的，因此如果 DOM 树节点非常庞大，递归会执行很多层消耗大量内存导致卡顿，甚至可能导致 stack overflow。

（2）从时间复杂度来讲，O(n)的复杂度在大规模节点的情况下也是灾难性的，并且 JS 作为单线程语言，在渲染这些节点时会占用浏览器的大量资源和时间，导致浏览器无法处理其他任务，从而出现卡顿。

（3）上述考虑的只是单次渲染时，render 产生的问题。对于组件更新和重绘场景而言，如果组件的粒度太大或者父组件 props 更新引起了不必要的子组件更新，DOM Diff 的性能都会变差。

优化：

（1）对于内存占用的问题，可以进行 dead block 相关的优化，比如用 weakmap 代替 map

（2）对于主线程时间占用的问题，可以开启 web worker

（3）对于重绘回流的问题，可以尽可能减小组件粒度，使用 React.memo 减少父子组件的更新耦合

## 3.单元测试初识

借助 vitest 可以在开发过程中直接避免一些错误的发生，不再需要繁琐地 console log

## 4.jsx pragma

jsx pragma 是一种编译器预处理指令，告诉编译器应该用什么方式处理该文件。'use strict'也是一种 pragma

customize jsx pragma 有两种方式

1. 配置 Babel plugin options

2. 手动在每个模块开头添加 jsx pragma comment

## 5.文本节点

类型为 TEXT_ELEMENT，只需要设置 nodeValue 属性即可

## 6.对于浏览器中的 ESM，引入 js 和 ts 文件的时候一定要加上扩展名，否则无法识别引入路径

# 思考完善

第一节的课程中还有一些细节没有考虑到

1.createElement 对于类型为 string 和 number 的元素都是直接渲染的，boolean null undefined 不会被渲染

```js
children: children.map((child) => {
  // react的createElement对于string和number都是直接渲染的，boolean null undefined不会被渲染
  return /^(string|number)/.test(typeof child)
    ? createTextNode(child)
    : child;
}),
```

2.props 处理时，应该考虑 style 是一个 object、可能有 symbol 属性

```jsx
function renderPlus(el, container) {
  // 根据type创建dom
  const dom =
    el.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(el.type);
  // 给dom添加上除了children之外的属性
  Reflect.ownKeys(el.props).forEach((key) => {
    switch (key) {
      // 处理样式obj
      case 'style':
        const styleObj = el.props.style;
        Object.keys(styleObj).forEach((styleKey) => {
          dom.style[styleKey] = styleObj[styleKey];
        });
        break;
      // 递归处理children
      case 'children':
        el.props.children.forEach((child) => {
          render(child, dom);
        });
        break;
      // 其他属性直接添加即可
      default:
        dom[key] = el.props[key];
        break;
    }
  });
  container.append(dom);
}
```

```jsx
import React from './React.js';
const ReactDOM = {
  createRoot(container) {
    return {
      render(el) {
        React.renderPlus(el, container);
      },
    };
  },
};
export default ReactDOM;
```

```js
const App = React.createElement(
  'div',
  {
    id: 'app',
    className: '1',
    style: {
      color: 'white',
      backgroundColor: 'gray',
      fontWeight: 'bolder',
      fontSize: '40px',
    },
  },
  'mini react application',
  '!!'
);
```

![截屏2024-01-13 15.15.09](./assets/%E6%88%AA%E5%B1%8F2024-01-13%2015.15.09.png)
