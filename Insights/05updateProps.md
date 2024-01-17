# 1.如何得到新的 DOM 树

update 函数不希望传入 el 和 container，获取 el 和 container 就需要在初始 render 完毕、root 重置为空值之前，再次用一个全局变量保存 root 即可

# 2.如何将新老 DOM 节点对比

如果对于每个新的 vDOM 节点，都是通过遍历老 DOM 树才找到老的 DOM 节点，效率太低

由于老的 DOM 树在构建过程中产生了链表关系，因此在新 DOM 树转构建链表的过程中，动态创建指针 alternate 指向老 DOM 树中的对应节点即可，后续对比新旧 props 时的效率非常高，无需遍历查找

在处理 children、构建链表关系的时候，根据当前 fiber 是否有 alternate 判断当前是 render 阶段还是 update 阶段，并给对应的节点创建 effectTag 标识，方便后续 commitWork 的时候分情况处理——如果是'update'就更新 props，如果是'placement'就添加节点

# 3.如何 diff props

对新旧 props 依次比较，有三种情况:

1.old 有 new 没有 删除

2.new 有 old 没有 添加

3.new 有 old 有 值不同 更新

问题：调用组件的时候传入 count，视图不更新

原因：全局声明了一个 count，但是在传入组件的时候如果直接传 count，primitive value 传值的时候是复制了一份。因此即使在 clickHandler 中更新了 count，但是组件内使用的并不再是 count 了，而是值相同的另一个 number。

问题：为什么 count 要在函数组件外声明

原因：由于组件更新之后重新执行了一遍函数、重新创建了一棵 DOM 树，如果状态变量 count 在函数内定义，在更新之后，上一次的闭包已经销毁了，状态并没有变化，所以状态变量 count 必须放在组件函数的外面、全局闭包内，让渲染阶段和之后的所有更新阶段都可以更改和访问到同一个 count 变量
