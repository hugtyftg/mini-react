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
}
export type { VNodeType, VirtualDOM, Fiber };
