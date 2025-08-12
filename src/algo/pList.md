---
title: "链表"
date: 2025-06-20
tags:
  - 数据结构
---
# 链表

## 203. 移除链表元素

* 如果不引入虚拟头节点的话。需要区分头节点的处理方式和中间节点的处理方式。
* 如果引入虚拟头节点，一切都可以按照中间节点的处理方式。

## 707. 设计链表
可以自己创建一个数据结构ListNode，我可太牛逼了直接再MyulinkedList上梭哈
自己创一个ListNode的话，那就可以存size了，时间复杂度会友好！同样也可以存一个vhead，一切都变得很顺利
注意细心一点，以后可以重复练练

## 206. 反转链表
1. 每次对接两个节点，一个pre，一个cur
2. cur.next预先存起来
3. 从第一个元素开始，也就是pre=null, cur=head 
4. 到最后元素的后一个结束，也就是pre=lastnode, cur=null 

## 24. 两两交换链表中的节点
比较简单，要处理1和2的话，就要找到0
1. 注意.next.next的有效性判断，避免空指针异常

## 141. 环形链表
此题实际上是一个数学题。可以通过简单的画图推导发掘关系。
1. 有环 --> 快慢指针会相遇
2. 入口 --> a从相遇处开始，b从head开始，两个一步步走，终究会在入口处遇见 （由画图推导得来的关系）

## 19. 删除倒数第n个节点
找倒数第n个，可以通过快慢指针法来找，快指针先移动n步，然后快慢指针同时移动直至快指针移动到末尾。
1. 要删倒数第n个，那么最终应该找到倒数第（n+1）个节点！


## 707. 设计链表
- 描述：实现链表的基本操作，必做题
- 注意：其实没啥，主要是有很多边界情况要多次提交，哪里错补哪里


## 83. 删除排序链表中的重复元素
- 描述: 链表[1,1,2] -> [1,2]
- 注意：一旦遇到下一个和下下个值一样，那就跳过下下个，直接指向下下下...

## 82. 删除排序链表中的重复元素II
- 描述: 链表[1,1,2] -> [2]
- 注意：一旦遇到下一个和下下个值一样，那就一直删除到不一样为止

## 206. 反转链表
- 描述：整个链表反转[1,2,3,4,5] -> [5,4,3,2,1]
- 实现：pre=null, cur=head，然后一个个逆向
- `nxt = cur.next` `cur.next = pre` `pre = cur` `cur = nxt`

## 92. 反转链表II
- 描述：反转部分链表[1,2,3,4,5] -> [1,4,3,2,5]
- 实现：找反转区域，区域内以206的思路反转
- 注意：最后拼接最好画个图 `allPreNode.next.next = allEndNode` `allPreNode.next = pre`
    
## 141. 环形链表
- 描述：判断链表是否有环
- 实现：快慢指针，快指针走两步，慢指针走一步
  `while(fast&&fast.next){...}` 无环会跳出，有环相遇判断跳出

## 142. 环形链表II
- 描述：判断并返回环形链表的入口节点
- 实现：在141的基础上，从相遇点开始，两个慢指针一个从头，一个从相遇点同步走，这俩相遇的时候就是入环的地方
  ![环形链表入口](../assets/环形链表入口.jpg)

## 19. 删除链表的倒数第N个节点
- 快慢指针，注意索引

## 876. 链表的中间节点
- 快慢指针，注意索引

## 2. 两数相加
- 描述：这种题目都不可能转为number再相加，只能按digit相加进位
- 实现：两个链表同时遍历，注意进位的处理，外置一个carry变量，每次都更新
  ```js
    let cur1 = l1, cur2 = l2
    let head = new ListNode(-1)
    let cur = head
    let carry = 0 // 进位 !

    while (cur1 || cur2 || carry) {

        // 算好digit和carry
        const val1 = cur1 ? cur1. val : 0
        const val2 = cur2 ? cur2. val : 0
        const sum = val1 + val2 + carry
        carry = sum / 10 | 0
        const digit = sum % 10

        cur.next = new ListNode(digit)
        cur = cur.next

        if (cur1) cur1 = cur1. next
        if (cur2) cur2 = cur2. next
    }

    return head.next
  ```

## 146. LRU Cache

体量很大的一题

- 哈希表 + 双向链表
- 链表中，离head越近表示越新
- 固定的 demmyHead + dummyTail， 通过头插法保持头尾固定
- dummyTail 实现了 O(1) 查找链表末尾元素
- 实现的时候要有提取公共方法的意识，比如 `deleteNode` `headInsert` `move2head`
- 不要遗漏了 map 的操作
## 25. K 个一组反转链表

1. `dummyHead`
2. 启一个 while true
3. 找 k 个作为一个 group，找不到的时候退出循环
4. **头插法**反转，每次只操作 k - 1个节点
5. 注意 group 之间的**连接**操作


## 23. 合并 K 个升序链表

给一个链表数组，每个链表都是升序的，把他们合并为一个升序链表。

1. 合并两个有序链表的 function
2. 朴素两两合并---> 进阶归并合并
```js
    // 方法二：分治合并
    function merge(lists, left, right) {
        if (left === right) return lists[left]
        if (left > right) return null
        const mid = (left + right) / 2 | 0
        const lpart = merge(lists, left, mid)
        const rpart = merge(lists, mid + 1, right)
        return merge2list(lpart, rpart)
    }
    return merge(lists, 0, lists.length - 1)
```

## 143. 重排链表

给定一个单链表 `L` 的头节点 `head` ，单链表 `L` 表示为：
`L0 → L1 → … → Ln - 1 → Ln`
变为
`L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …`

方法一：时间 O(n2) 
每次找尾巴，然后头插入。

方法二: 找中间节点 + 反转后半部分 + 合并两链表


## 160. 相交链表

如下图，找到相交节点。
![](../assets/Pasted%20image%2020250810225018.png)
方法一：哈希表
A 先遍历一遍，构建哈希表，注意哈希表是存整个 `node` ， B 再走一遍，有相同的话，就是相交节点。

方法二：双指针同时走，终点换赛道，总会相遇，null 也是一种相遇

![](../assets/Pasted%20image%2020250810225158.png)
```js
var getIntersectionNode = function (headA, headB) {
    let curA = headA
    let curB = headB
    while (curA != curB) {
        if (curA) curA = curA.next
        else curA = headB  // 换赛道

        if (curB) curB = curB.next
        else curB = headA // 换赛道
    }
    return curA
```