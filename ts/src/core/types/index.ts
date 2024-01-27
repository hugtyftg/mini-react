type VNodeType = string | Function; // 元素节点 文本节点 或者 函数组件
interface VirtualDOM {
  type: VNodeType;
  props: {
    children: VirtualDOM[];
    style?: object;
    className?: string;
    [prop: string]: any;
  };
}
interface Fiber extends VirtualDOM {
  dom: null | Text | HTMLElement; // 初始创建出fiber还没处理的时候，dom为空
  parent: null | Fiber; // root fiber没有parent
  child: null | Fiber; // 初始创建出fiber还没处理的时候，child为空
  sibling: null | Fiber; // 初始创建出fiber还没处理的时候，child为空
  alternate: null | Fiber; // 初始化阶段创建的fiber没有alternate
  effectTag: 'update' | 'placement'; // 标记当前fiber用于初始化渲染还是更新阶段，在统一提交阶段分情况处理
  stateHooks?: StateHook<any>[];
}
interface StateHook<T> {
  state: T;
  updateQueue: Array<() => T>;
}
export type { VNodeType, VirtualDOM, Fiber, StateHook };
