---
title: "二叉树"
date: 2025-05-06
tags:
  - 数据结构
---
> 有关二叉树、二叉搜索树、满二叉树、完全二叉树等经典题目的核心思路### 1. 前中后序遍历的递归实现 -- EZ
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