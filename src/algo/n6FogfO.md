---
title: "树和图"
date: 2025-07-01
tags:
  - 数据结构
---


### 2. 前中后序遍历的非递归实现 -- Oh no
---

### 3. 层序遍历 -- 注意有关层级的处理
    
```js
    var levelOrder = function (root) {
        if (!root) return []

        const result = []
        const Q = []

        Q.push(root)

        let layer = []

        while (Q.length) {

            // 有关层级的处理，这也太妙了！
            const levelSize = Q.length
            layer = []

            for (let i = 0; i < levelSize; i++) {
                const node = Q.shift()
                layer.push(node.val)
                Q.push(node.left)
                Q.push(node.right)
            }

        }
        return result
    };
```
    
    - 求层平均值
    - 求树的右视图
    - 求层最大值
---
  
### 4. 翻转二叉树
  - 交换左右孩子即为翻转

---

### 5. 判断是否是对称二叉树
  - 关键是'对称'
    - 一个无左右孩子的节点 是对称的
    - 有左右孩子 且 左子树的内侧和右子树的内侧一致 且 左子树的外侧和右子树的外侧一致 是对称的
   
---

### 6. 求二叉树最大深度
  - 递归方案 
    - 采用后序遍历的形式 
    ```js
    function depth(node){
        if(!node) return 0
        const ld = depth(node.left) // 左
        const rd = depth(node.right)// 右
        return 1 + max(ld, rd)      // 中
    }
    ```
  - 回溯方案
    - 待补充...
  - 迭代方案
    - 基于队列的层序遍历实现，最大层数即为最大深度
  
---


### 7. 求二叉树最小深度
  - 需要注意最小深度的理解：指的是从根节点到最近的`叶子节点`
  - 递归实现，后序遍历模式
    ```js
    function minDepth(node){
        if(!node) return 0
        const ld = minDepth(node.left)
        const rd = minDepth(node.right)

        // 为了求到最近`叶子节点`的深度
        if(node.left == null && node.right) return 1 + rd
        if(node.right ==null && node.left)  return 1 + ld

        return 1 + min(ld, rd)
    }
    ```
  - 迭代实现，层序遍历
    - 核心: 层序遍历遇到的第一个叶子节点，该节点深度代表了二叉树的最小深度，此处直接return

---


### 8. 求完全二叉树的节点个数
> 刚看到题目的时候挺懵的，统计节点个数，那不就是遍历一下吗。
> 是的，最简单的方案就是 A.像求深度一样递归  B.层序遍历

👉 这里记下优化的方法
  - 完全二叉树只有两种情况
  -- 满二叉树，满足节点数为 2^n - 1
  -- 非满二叉树1
  - 所以这里的思路就是通过满二叉树节点个数公式计算来优化

👉 那么如何判断是否为满二叉树？
  - 在完全二叉树的基础上，递归向左遍历的深度等于递归向右遍历的深度即为满二叉树
  
👊 实现思路:
    1. 基于输入的完全二叉树，求左深度，求右深度
    2. 如果左右相等，返回 2^depth - 1
    3. 否则，返回 1 + 左子树节点统计结果 + 右子树节点统计结果
```js
    function countIt(node){
        if(!node) return 0
        let ld = 0, rd = 0
        let t = node 
        while(t){
            ld++
            t = t.left
        }
        t = node
        while(r){
            rd++
            t = t.right
        }

        if(ld === rd) return 2^ld - 1
        else return 1 + countIt(node.left) + countIt(node.right)
    }
```

---
### 8. 平衡二叉树判断

> 平衡二叉树：树中的**每个**节点的左右两个子树的高度差不超过 1
> 既然是每个节点，也就意味着，孩子节点不平衡，那爹也就不平衡

So，递归地看，对于一个二叉树节点
  1. 临界：node == null
  2. 计算左孩子节点平衡情况及高度
  3. 左孩子节点不平衡则直接返回不平衡
  4. 计算右孩子节点平衡情况及高度
  5. 右孩子节点不平衡则直接返回不平衡
  6. 计算左右孩子树的高度差，大于1则返回不平衡，否则返回 1 + maxChildHeight

```js
// 这里比较妙，当高度为tag时表示不平衡
  function height(node) {
      if (!node) return 0

      const leftH = height(node.left)
      if (leftH === unbalanceTag) return unbalanceTag

      const rightH = height(node.right)
      if (rightH === unbalanceTag) return unbalanceTag

      if (Math.abs(leftH - rightH) > 1) return unbalanceTag

      return 1 + Math.max(leftH, rightH)
  }
```

---

### 9. 二叉树所有路径 -- 回溯

> 递归算法本身就带有回溯机制，这是JS执行环境的函数调用栈帮我们实现的， 看下面的图
> 此处我们需要手动记录回溯，手动更改回溯的副作用！

- 采用先序遍历，根左右，因为这是从根向下的路径
- 此题需要注意数组的拷贝，否则同一个引用，最终path都是空值 :😄


```js
 function preTravel(node) {
      if (!node) return

      p.push(node.val)
      if (node.left == null && node.right == null) {
          paths.push(p.slice())
      }

      preTravel(node.left)
      preTravel(node.right)
      p.pop()
  }

```

### 10. 由中序和后序构建二叉树 -- 递归
> 核心：
> JS Array.prototype相关方法的使用
>  - indexOf() --> 返回第一次出现的下标
>  - slice()   --> 返回原数组的浅拷贝（包括 start，不包括 end）
> 注意下标的处理!


### 11. 验证二叉搜索树 ！！！
> Solutions:
> 1. 要利用二叉搜索树的特性，中序遍历二叉树， 然后判断结果是否是一个递增序列
> 2. 在中序遍历过程中进行判断，左中右， 维护一个最大值
> 3. 忌单纯比较中间节点和左右值的大小


## 非递归遍历法

空指针标记法，通过null标记，把遍历过程和处理过程分离开来

### 中序遍历
```js
var inorderTraversal = function (root) {
    if (root == null) return []

    let res = []
    let stack = []
    stack.push(root)

    while (stack.length) {

        let node = stack.pop()

        if (node != null) { // 遇到了-新节点- , 不处理当前节点 ,右根左入栈

            if (node.right) stack.push(node.right)

            stack.push(node)
            stack.push(null) // 遇到null的话，就处理前一个节点

            if (node.left) stack.push(node.left)
        }
        else {
            // node === null
            res.push(stack.pop().val) // 直接处理前一个节点
        }

    }

    return res
};
```


### 前序遍历
因为前序遍历里，遍历过程和处理过程是同步的, 所以可以删减空指针的逻辑
```js
var preorderTraversal = function (root) {
    if (root == null) return []

    const stack = []
    const res = []
    stack.push(root)

    while (stack.length) {

        const node = stack.pop()

        if (node !== null) {
            // 遇到新节点，右左根入栈，
            if (node.right) stack.push(node.right)
            if (node.left) stack.push(node.left)
            // stack.push(node)
            // stack.push(null)
            res.push(node.val)
        }

        // else {
        //     res.push(stack.pop().val)
        // }
    }
    return res
};
```

### 后序遍历
```js 
var postorderTraversal = function (root) {
    if (!root) return []

    const stack = []
    const res = []
    stack.push(root)

    while (stack.length) {

        const node = stack.pop()

        if (node != null) {
            // 遍历遇到新节点，不急着处理，根右左入栈
            stack.push(node)
            stack.push(null)
            if (node.right) stack.push(node.right)
            if (node.left) stack.push(node.left)
        }
        else {
            res.push(stack.pop().val)
        }
    }
    return res
};
```

## 层序遍历
- 队列实现
```js
var levelOrder = function (root) {
    if (!root) return []
    let res = []
    let q = [root]
    while (q.length) {

        let size = q.length // 当前层节点数量
        let level = [] // 当前层的节点值
        for (let i = 0; i < size; i++) {
            let node = q.shift() 
            level.push(node.val)
            node.left && q.push(node.left)
            node.right && q.push(node.right)
        }
        res.push(level)

    }
    return res
};
```

## 层序遍历送分题
    
- 102. 二叉树的层序遍历
- 103. 二叉树的锯齿形层序遍历
    - 每一层方向不一样，需要一个变量来记录方向，需要逆向的话reverse一下
- 107. 二叉树的层序遍历 II
    - 要求从下往上层序遍历，只需要在最后reverse一下
- 104. 二叉树的最大深度
    - 到最后返回level
- 111. 二叉树的最小深度
    - 遇到叶子节点就返回
- 199. 二叉树的右视图
    - 每层只收集最后一个节点


## 124. 二叉树中的最大路径和
- 描述：从二叉树中找到任意一条路径(可以不经过根节点)，使得路径上节点值的和最大
- 思路：
    - 一条和最大的路径会由啥组成？在二叉树中可能是从下到上再到下，这样一条路径
    - 节点的最大贡献度：从下到该节点这样一条路径(单边+根)
    - `maxGain = node.val + max(leftMaxGain, rightMaxGain)`
    - 节点的最大路径和：以该节点为根的，从下到上到该节点再往下的那么一条路径
    - `maxPathSum = node.val + leftMaxGain + rightMaxGain`
    - 计算当前节点的最大路径和可以包含左右节点，但最大贡献度不能只包含单边。
    - 所以，递归地，从根往上递归，维护一个maxSum
```js

const maxPathSum = function (root){
    let maxSum = -Infinity

    const maxGain = (node)=>{
        if(node == null) return 0
        const leftMaxGain = Math.max(maxGain(node.left), 0)
        const rightMaxGain = Math.max(maxGain(node.right), 0)

        const nodeMaxGain = node.val + Math.max(leftMaxGain, rightMaxGain)

        const maxPathSum = node.val + leftMaxGain + rightMaxGain
        if(maxPathSum > maxSum) maxSum = maxPathSum

        return nodeMaxGain
    }

    maxGain(root)
    return maxSum
}

```

## 543. 二叉树的直径
- 描述：给定一颗二叉树，求其直径，即任意两个节点之间的最长路径长度
- 思路：
    - 直径 = 左子树高度 + 右子树高度
    - 所以，递归地，从根往下递归，维护一个maxDiameter

- 备注：原来124、543这就是所谓的树形DP，上面的节点状态依赖下面子节点的状态，递归过程通常体现为后序遍历的形式，因为要先处理子节点，再处理父节点，然后在遍历过程中维护答案即可。

## 101. 对称二叉树
- 注意：表面上是简单题，实则是一种特殊的遍历方式（基于队列的一种遍历）
- 描述: 判断一颗二叉树是否是轴对称的
- 思路：
    - 一开始想的是左中右和右中左遍历，然后比较，但需要额外空间，要写很多，复杂度高
    - 然后想到层序遍历，比较每一层是否是回文，但是null啥的要有额外逻辑
    - 最后采用特殊的队列实现
    - 把应该比较的节点作为一对，每次成对地入队
    - 每次成对地出队，比较两个节点是否相等

```js 
// 如果为空root 或 无子节点，返回true
if(root == null || noChildNode(root)) return true

const q = []
q.push(root.left, root.right) // 入队这一对需要比较的节点

while(q.length){
    const nodeA = q.shift()
    const nodeB = q.shift()

    if(!issame(nodeA, nodeB)) return false
    
    q.push(nodeA.left, nodeB.right) // ！！！
    q.push(nodeA.right, nodeB.left) // ！！！
}
return true
```


## 112. 路径总和
- 描述：判断一颗二叉树是否存在一条从根到叶子的路径，使得路径上节点值的和等于目标值
- 注意：表面上是简单题，实则是一种特殊的遍历方式（类似链表cur指针的遍历）
- 思路：cur指针从根节点开始，向下遍历，并记录当前sum，遇到叶子节点时，判断sum是否等于目标值 

## 113. 路径总和 II
- 描述：这题和上题类似，但需要记录所有路径
- 实现：需要一个path数组来记录路径，而且要记得回溯，在dfs方法的最后pop
- 优化：引入一个targetSum参数，每次就在原始targetSum的基础上减去node.val，判断就变成了判断targeSum==0

```js
// 核心函数伪代码
function dfs(node, targetSum){

    if(!node) return

    // 处理当前节点
    path.push(node.val)
    targetSum -= node.val

    if(!node.left && !node.right && targetSum == 0){
        res.push(path.slice()) // 必须slice或者[...path]，否则是浅拷贝会有问题
    }

    path.pop() // 回溯
}
```

## 236. 二叉树的最近公共祖先
- 描述：给定一个二叉树，找到两个节点的最近公共祖先
- 思路：
    - 首先,LCA(p, q)就是三种情况
        1. p和q一个在node的左子树，一个在右子树，此时node就是LCA
        2. p为LCA
        3. q为LCA
    - 为了找最近的，所以我们从下往上找，采用后序遍历
    - 对于节点N，如果N的左子树和右子树分别包含pq，那么N就是LCA
    - 如果仅在左子树包含pq，那么LCA在左子树，右子树同理
    - 如果都不包含，那么N无效，直接返回

## 226. 翻转二叉树
- 描述：给定一颗二叉树，左右对称翻转
- 实现：可以自上而下，也可以自下而上

## 958. 二叉树的完全性检验
- 描述：判断一颗二叉树是否是完全二叉树
- 注意：如果是完全二叉树的话，那么从上到下，从左到右遍历，不会遇到null节点
- 注意：我经常习惯于当子节点存在时才入队，其实可以入null
- 实现：添加一个flag，如果遇到null节点，flag为true，如果后序还会遇到非null节点，说明不是完全二叉树

## 572. 另一颗树的子树
- 描述：给两个树，判断t是否是s的子树
- 注意：此题里面，树中有重复节点，别被简单题给欺骗了，还是需要写二三十行的
- 实现：
    1. 辅助函数：compare(rootA, rootB), 判断两棵树是否相等（先序遍历）
    2. 驱动函数：先序遍历s，如果遇到s的节点和t的根节点相等，则调用辅助函数判断两棵树是否相等

## 116. 填充每个节点的下一个右侧节点指针 | 117. 填充每个节点的下一个右侧节点指针 II
- 描述：给一颗树，让每个节点的next指针指向其右兄弟节点
- 实现：层序遍历的时候，在每一层先遍历把节点串起来，再遍历shift、pop啥的

## 105. 由前序中序构建二叉树 | 106. 由中序后序构建二叉树
- 思路：递归实现，每次取根，递归得子树，挂载子树并返回，递归终止条件是参数序列中只有一个元素或者为空

## 889. 由前序和后序构造二叉树
- 思路：和上面思路类似，关键在于，前序和后序无法确定唯一二叉树，因为分割不了左右子树，所以我们可以假设有左子树，把前序遍历的第二个元素作为左子树的根节点，以此来划分区间。

## 98. 验证二叉搜索树
- 思路：中序遍历，判断是否递增，或者用变量记录中序遍历的节点值，在递归中判断是否递增

## 450. 删除二叉搜索树的节点
- 描述：给定一颗二叉搜索树，删除值为key的一个节点
- 实现：
    1. 找待删节点N
    2. 删除并嫁接子树
        - 如果只有单边子树，那删完，子树直接接上就行
        - 如果有左右子树，那以右子树为根，把左子树接到右子树最左边的节点下

## 174. 寻找目标节点
- 白给型

## 230. 二叉搜索树中第K小的元素
- 实现：可以直接中序遍历返回第k个元素
- 优化：中序遍历，当结果数组找到第k个元素时，直接返回
- 同理：如果找第k大的元素，那就右中左遍历，当找到第k个元素时，直接返回



## 200. 岛屿数量
- 描述：在一个由 `'0'` 和 `'1'` 组成的二维矩阵内，找到包含 `'1'` 的独立区域(岛屿)，并返回区域的数量，题目规定了`'1'` 的上下左右四个方向相邻的 `'1'` 属于同一个岛屿，不考虑斜边。
- 实现：
    - 使用DFS实现，每次DFS时，将当前遍历到的岛屿联通区域置为0，“消除”岛屿
    - 遍历元素，进行DFS，如果遇到`'1'`，则说明这个岛屿之前没遍历到，是独立岛屿，数量+1

## 695. 岛屿最大面积
- 与200同理，在DFS时记录当前岛屿的面积，DFS后维护最大值


## 129. 求根节点到叶子节点的数字之和
- 描述：给定一个二叉树，每个节点都包含一个数字，从根节点到叶子节点的路径上将每个节点上的数字拼接成一个数字，求所有路径上数字的和。
- 实现：DFS 回溯
    - 注意用个oldValue记录原来的值，方便回溯


## 543. 二叉树的直径  124. 二叉树中的最大路径和
- 树形DP：父状态依赖于子树状态，在遍历过程中维护答案

## 662. 二叉树的最大宽度
- 描述：给定一个二叉树，求其一层中，最左和最右节点之间的距离（以完全二叉树计算距离）
- 实现：层序遍历，给每个节点多加个id属性，id为节点在完全二叉树中的编号，然后维护一个maxWidth，每次遍历到新层时，计算当前层的最左和最右节点的id差值，更新maxWidth
- 注意：数字会溢出，所以在给下一层编号时，应该 curId = curId - levelStartId, 然后左右节点再在curId的基础上 `* 2 + 1 `， `* 2 + 2 `