---
title: "队列和优先队列"
date: 2025-06-24
tags:
  - 数据结构
---


### 622. 设计循环队列
- 描述：设计一个循环队列，支持`enqueue` `dequeue` `isEmpty` `isFull` 等操作
- 注意：留一个空位，判断队列空和满，空就是`head === tail`，满就是`(tail + 1) % capacity === head`;另外注意统一左闭右开

### 优先队列
    
普通队列是单纯的先进先出，优先队列是**优先级高的先出**    
     
如果用数组或链表实现，入队和出队总是O(1) + O(n),毕竟要遍历查找插入位置，或遍历查找最大优先级元素。   
    
所以一般用堆实现，堆的插入和删除都是O(logN)，总体更好。
    
还优先队列，但这不就是大顶堆嘛？😂

### 单调队列

类似单调栈

### 239. 滑动窗口最大值
- 描述：给一个数组，和一个窗口大小，窗口从左到右滑动，每次返回窗口中的最大值构成的数组
- 思路：
  - 采用单调队列实现，总是维护一个单调递减的队列，和单调栈的入栈操作类似
  - 入栈时，如果栈顶元素比当前元素小，则弹出栈顶元素，最后把当前元素入栈
  - 出栈时，判断弹出元素是否是窗口的左边界(队头元素)，如果是，则弹出
- 实现：
  - MonoQueue
  ```js
    class MonoQueue {
      constructor() {
        this.q = []
      }

      enq(val) {
        while(this.q.length && this.q[this.q.length - 1] < val) {
          this.q.pop()
        }
        this.q.push(val)
      }

      deq(val){
        if(this.q.length && this.q[0] === val) {
          this.q.shift()
        }
      }

      top() {
        return this.q[0]
      }
    }
  ```
  - Logic
    - 先把前k个元素入队，然后取top加入结果数组
    - 遍历剩余元素，先出队`deq(nums[i - k])`，然后入队`enq(nums[i])`，最后取top加入结果数组


### 703. 数据流中的第K大元素
- 描述：先给一个k和一个nums，后续一个个添加元素，每次添加时返回当前数据流中的第k大元素
- 思路：
  - 在初始时进行排序，每次添加元素时从末尾向前冒泡保证有序，最后返回第k大元素
  - 维护一个大小为k的大顶堆，注意在shift时，如果大小为0，返回空，如果**大小为1直接shift**，其余尾巴上至堆顶再下沉

- 代码贴一个，省的每次重复写，已经是肌肉记忆了...
  ```js
    class MinHeap {
      constructor() {
          this.arr = []
      }

      down(i) {
          const left = i * 2 + 1
          const right = i * 2 + 2
          let mostMin = i

          if (left < this.arr.length && this.arr[left] < this.arr[mostMin]) mostMin = left
          if (right < this.arr.length && this.arr[right] < this.arr[mostMin]) mostMin = right

          if (mostMin != i) {
              [this.arr[mostMin], this.arr[i]] =
                  [this.arr[i], this.arr[mostMin]]
              this.down(mostMin)
          }
      }
      up(i) {
          if (i == 0) return
          const father = (i - 1) / 2 | 0
          if (father >= 0 && this.arr[father] > this.arr[i]) {
              [this.arr[father], this.arr[i]]
                  = [this.arr[i], this.arr[father]]
              this.up(father)
          }
      }

      insert(val) {
          this.arr.push(val)
          const id = this.arr.length - 1
          this.up(id)
      }

      shift() {
          if (this.arr.length == 0) return null
          if (this.arr.length == 1) return this.arr.pop()
          const res = this.arr[0]
          const last = this.arr.pop()
          this.arr[0] = last
          this.down(0)
          return res
      }

      size() {
          return this.arr.length
      }
      top() {
          return this.arr[0]
      }
    }
  ```

### 703. 前k个高频元素 | 451. 根据字符出现频率排序 | 973. 最接近原点的K个点
- 都是一个套路，用哈希表统计频率/计算距离，然后维护一个大小为k的小顶堆，最后返回堆中的元素
- 或者排序，快速选择 or 桶排序都行