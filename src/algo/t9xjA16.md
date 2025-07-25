---
title: "字符串"
date: 2025-06-24
tags:
  - 数据结构
---

### 注意：
- 在js里，字符不能直接和数字比较，需要先转换为ASCII码，`'a'.charCodeAt() === 97`
- 大小写转换：`'a'.toUpperCase() === 'A'`，`'A'.toLowerCase() === 'a'`
- 字符串的运算：字符和字符的加法、字符和数字的加法是OK的，其他的减法、乘法都不行
  ```js
    console.log('b' + 'a' === 'ba', 'b' + 'a') //true 'ba'
    console.log('b' * 2 === 'bb', 'b' * 2) //false NaN
    console.log('b' - 'a' == 1, 'b' - 'a') //false NaN
    console.log(97 - 'a', 'a' - 97) //NaN NaN
    console.log(97 + 'a', 'a' + 97) //97a a97
  ```
  


### KMP手写
描述：实现`getNext`函数，返回next数组, 实现`strStr`函数，返回子串在主串中的位置
```js 
  function getNext(s) {
      // next[i-1] 存的是字符串str的[0,i]部分的最长相等前后缀长度
      // 当kmp用next的时候，如果s[i] != s[j]，那么把j回退到next[j-1]
      const next = [0]
      let j = 0, i = 1 // j是前缀末尾，i是后缀末尾
      while (i < s.length) {

          while (j > 0 && s[i] !== s[j]) {
              j = next[j - 1]
          }

          if (s[i] === s[j]) {
              j++
          }
          next[i] = j
          i++
      }
      return next
  }
```

```js

function strStr(ogStr, subStr) {

    const next = getNext(subStr)
    let i = 0, j = 0

    while (i < ogStr.length && j < subStr.length) {
        while (j > 0 && ogStr[i] !== subStr[j]) {
            j = next[j - 1]
        }
        if (ogStr[i] === subStr[j]) {
            j++
        }
        i++
    }
    return j === subStr.length ? i - j : -1
}
```

### 409. 最长回文串
- 描述：给定一个字符串，求其中的字符能组成的最长回文串长度
- 思路：
  - 这题是可以用字符组合成回文串，所以考虑如何组合得到一个回文串
  - 回文串 === `任意个出现偶数次的字符 + (中间一个出现奇数次的字符)`
  - Step1：统计每个字符出现的次数
  - Step2：遍历表，出现偶数次的字符，直接累加
  - Step3：如果存在出现奇数次的字符，可以**把其中的偶数次累加**，**最后再+1**

### 5. 最长回文子串
- 描述：给定一个字符串，求其中的最长回文子串
- 注意：这题是子串问题，要保持原顺序，找到原始串中满足条件的一个子串
- 思路：
  - 1. 暴力枚举所有字符串，再判断是否是回文串，维护最大值，O(n^3)
  - 2. 中心扩散法，遍历中心i，再以i为中心向两侧扩散，维护最大值，O(n^2)
  - 3. 动态规划法，dp[i][j]表示[i,j]是否是回文串，dp[i][j] = dp[i+1][j-1] && s[i] === s[j]，维护最大值

- 实现：
  - 中心扩散法：
    - 遍历中心i，再以i为中心向两侧扩散，维护最大值
    - 注意：中心点可能是单个字符，也可能是两个字符，考虑两种情况，从[i,i]开始扩散AND从[i,i+1]开始扩散
  - 动态规划法：
    - dp[i][j]表示[i,j]是否是回文串,故这个二维数组只有**右上角**的值是有效的，初始化只处理dp[i][i]
    - dp[i][j]依赖于dp[i+1][j-1]，所以**i从大到小**遍历，**j从`i+1`到大**遍历
    - 只有当`j>i+1`时，才需要判断dp[i][j]，否则dp[i][j] = dp[i] === dp[j]


### 3. 无重复字符的最长子串
- 描述：给定一个字符串，求其中的无重复字符的最长子串
- 注意：子串问题，保持原顺序，找到原始串中满足条件的一个子串
- 思路：维护一个滑动窗口，遍历入字符，如果字符在窗口内存在，则左边界右移动缩小窗口
- 实现：
  - 数组实现：靠`indexOf`判断是否存在，靠`shift`和`push`维护窗口
  ```js
    while (window.length && window.indexOf(s[j]) != -1) {
        window.shift()
    }
    window.push(s[j])
    // window.length 就是窗口长度 
  ```
  - set实现：靠`hash`判断是否存在，靠`add`和`delete`维护窗口，自己移动左边界
  ```js
    while (window.has(s[j])) {
        window.delete(s[i])
        i++ // 自己移动左边界
    }
    window.add(s[j])
    // j - i + 1 就是窗口长度
  ```

### 49. 字母异位词分组
- 描述：输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]，输出: [["bat"],["nat","tan"],["ate","eat","tea"]]
- 思路：
  - 这题让我想到了昨天的*存在重复元素 III*，要把字母异位词分组放到一个桶里，考虑映射到同一个值
  - 映射函数 `let sortedStr = str.slice().split('').sort((a, b) => a.charCodeAt() - b.charCodeAt()).join('')`
  - 然后就是，遍历strs，把每个str映射到同一个值，然后放到哈希表的同一个key下
  - 最后遍历哈希表，组合答案

### 151. 翻转字符串里的单词

- 描述："the sky is blue" -> "blue is sky the"
- 注意：JS中的字符串API, `split` `join` `trim` `左闭右开slice` 
- 实现：
  - Method 1: 构建words数组，并反转，然后加上' ' 
    - `return s.split(' ').filter((val) => val !== '').reverse().join(' ')`
  - Method 2: 快慢双指针实现
    - 因为要求反转，所以从后向前遍历，快指针指向单词前的空字符，慢指针指向单词的尾巴字符
    - 初始化时，跳过末尾空格，此时快慢指针相等，都指向单词末尾
    - 快指针向前遍历，直到遇到空格，此时快慢指针之间就是单词，将单词加入结果数组
    - 加入后，跳过空格，再次让快慢指针相等，都指向单词末尾

    ```js
    var reverseWords = function (s) {
        let i = s.length - 1
        let res = ''

        // 初始时，去除尾部空格，ij相等，都指向单词末尾
        while (s[i] == ' ' && i > 0) i--
        let j = i

        while (i >= 0) {
            // i 向前找单词
            while (i >= 0 && s[i] != ' ') i--
            res = res.concat(s.slice(i + 1, j + 1)).concat(' ') // slice函数是左闭右开的,记得加个末尾空格，最后再移除

            // 跳过空格，使ij相等，都指向单词末尾
            while (i >= 0 && s[i] === ' ') i--
            j = i

        }

        return res.slice(0, res.length - 1)
    }
    ```

### 415. 字符串相加
- 描述：给定两个用字符串表示的非负整数，求它们的和
- 实现：遍历位数相加，注意进位
  - 下面的写法是**最优雅代码量最少的**，用一个大while控制了所有循环 `while (i >= 0 || j >= 0 || carry)`
  ```js
  var addStrings = function (num1, num2) {
    let i = num1. length - 1
    let j = num2. length - 1
    let carry = 0
    let res = []
    while (i >= 0 || j >= 0 || carry) {

        let a = i >= 0 ? Number(num1[i]) : 0
        let b = j >= 0 ? Number(num2[j]) : 0
        let sum = a + b + carry
        let digit = sum % 10
        carry = sum / 10 | 0
        // res.unshift(digit) //在头部插入，因为先算的个位
        res.push(digit)

        i--
        j--
    }
    return res.reverse().join('')
  }


### 43. 字符串相乘
- 描述：给定两个用字符串表示的非负整数，求它们的乘积
- 思路：[乘法的剖解](https://leetcode.cn/problems/multiply-strings/solutions/188815/gao-pin-mian-shi-xi-lie-zi-fu-chuan-cheng-fa-by-la/)
  - ![乘法剖解](/post-assets/043. png)
  - resArr的初始大小为`num1. length + num2. length`，因为两个数相乘，结果最多为两个数的长度之和
  - 处理i和j时，恰好对应resArr的`i+j`和`i+j+1`,主要是`i+j+1`低位加和
  - 最后把resArr转换为字符串，并去除前导0
  ```js
  var multiply = function (num1, num2) {

      if (num1[0] == 0 || num2[0] == 0) return '0'

      const size = num1. length + num2. length
      const resArr = new Array(size).fill(0)

      for (let i = num1. length - 1; i >= 0; i--) {

          for (let j = num2. length - 1; j >= 0; j--) {

              let multi = Number(num1[i]) * Number(num2[j])
              if (resArr.length > 1) {
                  let sum = multi + resArr[i + j + 1]
                  resArr[i + j + 1] = sum % 10
                  resArr[i + j] += Math.floor(sum / 10)
              }

          }
      }

      let start = 0
      while (start < resArr.length && resArr[start] === 0) start++

      return resArr.slice(start).join('')
  };
  ```

### 28. 找出字符串中第一个匹配项的下标
- 描述：KMP，但是直接用`indexOf`就能解决

### 208. 实现Trie(前缀树)
- 描述：实现一个Trie，支持插入、查找、前缀查找
- 实现：
  - Node结构包括`children = {}`和`isEnd = false`
  - 插入、查找和前缀查找都是相似的逻辑，一层层往下
  ```js
    Trie.prototype.insert = function (word) {
        let cur = this.root
        for (let char of word) {
            if (cur.children[char] !== undefined) {
                cur = cur.children[char] // 向下
            }
            else {
                const node = new Node()
                cur.children[char] = node
                cur = node
            }
        }
        cur.isEnd = true
    };
  ```