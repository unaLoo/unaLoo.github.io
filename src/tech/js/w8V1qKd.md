---
title: 'JavaScript 闭包'
date: 2025-06-11
tags:
  - JavaScript
---

> 闭包是 JavaScript 中一个重要的概念，它允许函数访问其词法作用域中的变量，即使在函数外部也可以访问这些变量。

## 什么是闭包？
    
**闭包 = 函数 + 函数所依赖的词法作用域**
    
闭包是 JavaScript 中一个非常重要的概念，一个**函数**（内部函数）能够**记住并访问**其外部函数（词法作用域）中变量，即使外部函数已经执行完毕了，这就是闭包的表现。

**形成条件：**

1.  **函数嵌套：** 必须是一个函数内部定义了另一个函数。
2.  **内部函数引用外部函数的变量：** 内部函数引用了外部函数作用域中的变量。
3.  **外部函数返回内部函数：** 或者内部函数在外部作用域之外被调用。

当外部函数执行完毕后，它的作用域通常会被销毁，但如果其内部函数（闭包）被外部引用，那么这个作用域就不会被销毁，而是会**保留**下来，供内部函数继续访问。


---

## 闭包的常见情景与应用

了解闭包的定义后，我们来看看它在实际开发中是如何发挥作用的。

### 1. 创建私有变量/私有方法（模块化）

这是闭包最经典的应用之一。JavaScript 本身没有传统意义上的“私有”成员修饰符。但通过闭包，我们可以模拟出私有变量和方法，实现信息隐藏。

**情景：** 你想创建一个计数器，其内部的计数变量不能被外部直接修改，只能通过特定的方法（如 `increment` 和 `decrement`）来操作。

```javascript
function createCounter() {
    let count = 0; // 这是一个局部变量，只在 createCounter 作用域内

    return { // 返回一个包含方法的对象
        increment: function() {
            count++;
            console.log('Count:', count);
        },
        decrement: function() {
            count--;
            console.log('Count:', count);
        },
        getCount: function() {
            return count;
        }
    };
}

const counter1 = createCounter(); // 每次调用 createCounter 都会创建一个独立的闭包
counter1. increment(); // Count: 1
counter1. increment(); // Count: 2
console.log('Current Count:', counter1. getCount()); // Current Count: 2

const counter2 = createCounter(); // 独立的计数器实例
counter2. increment(); // Count: 1
console.log('Current Count 2:', counter2. getCount()); // Current Count 2: 1

// 外部无法直接访问或修改 count 变量：
// console.log(counter1. count); // undefined
```

**闭包原理：** `increment`、`decrement` 和 `getCount` 这三个内部函数都形成了闭包，它们“记住”并共享了外部函数 `createCounter` 作用域中的 `count` 变量。即使 `createCounter` 已经执行完毕并返回了对象，`count` 变量依然存在于这些闭包中，因此它们能够继续操作同一个 `count`。

### 2. 缓存/记忆化 (Memoization)

闭包可以用来缓存函数的结果，避免重复计算，优化性能。

**情景：** 你有一个计算量较大的函数，希望在每次调用时，如果输入参数相同，就直接返回之前计算过的结果，而不是重新计算。

```javascript
function memoize(fn) {
    const cache = {}; // 外部作用域的缓存对象

    return function(...args) { // 返回的内部函数形成闭包，引用了 cache
        const key = JSON.stringify(args); // 用参数作为缓存的key
        if (cache[key]) {
            console.log('从缓存中获取:', key);
            return cache[key];
        } else {
            console.log('计算并缓存:', key);
            const result = fn(...args);
            cache[key] = result;
            return result;
        }
    };
}
```

**闭包原理：** `memoize` 函数返回的内部匿名函数形成了闭包，它持续访问并操作着 `memoize` 作用域中的 `cache` 对象。这样，`cache` 对象就成为了一个持久化的存储空间，用于缓存 `fibonacci` 函数的计算结果。

### 3. 函数柯里化 (Currying) 和偏函数应用

闭包可以帮助实现函数的柯里化，即把一个接受多个参数的函数转换成一系列只接受一个参数的函数。

**情景：** 你想创建一个通用的加法函数，但有时需要固定其中一个加数。

```javascript
function add(x) {
    return function(y) { // 返回的内部函数是闭包，记住了 x
        return x + y;
    };
}

const add5 = add(5); // add5 是一个闭包，它“记住”了 x = 5
console.log(add5(10)); // 15
console.log(add5(20)); // 25

const add10 = add(10); // add10 是另一个独立的闭包，它“记住”了 x = 10
console.log(add10(3)); // 13
```

**闭包原理：** `add` 函数返回的匿名函数是闭包，它“捕获”了外部 `add` 函数作用域中的 `x` 变量。每次调用 `add(X)` 都会创建一个新的闭包，拥有独立的 `x` 值。


### 4. Vue 中的闭包 (Setup)

Composition API 是 Vue 3 的核心特性，它大量依赖闭包来组织和复用逻辑,实现了逻辑的高内聚和复用。    
所有与某个功能相关的逻辑（响应式状态、计算属性、方法、生命周期钩子等）都可以组织在一起，形成一个独立的逻辑单元，并通过闭包访问共享的状态。这解决了 Options API 中逻辑分散的问题。

```js
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0); // 响应式变量

    const doubledCount = computed(() => { // computed 是一个闭包
      return count.value * 2; // 它访问了 setup 作用域中的 count
    });

    const increment = () => { // increment 方法是闭包
      count.value++; // 它访问了 setup 作用域中的 count
    };

    return {
      count,
      doubledCount,
      increment
    };
  }
};

```

### 5. Vue 中的闭包 (自定义Hooks)

自定义 Hooks 本质上就是返回响应式状态或方法的普通函数，是闭包的典型应用，极大地增强了逻辑复用性。
你可以将组件的某个逻辑（比如计数器逻辑、鼠标位置追踪逻辑、表单处理逻辑）封装成独立的 Hook，并在多个组件中重复使用，每个组件调用 Hook 都会得到一个独立的逻辑实例，其内部状态**通过闭包独立维护**。

```js
// useCounter.js (一个自定义 Hook)
import { ref, computed } from 'vue';

export function useCounter() {
  const count = ref(0); // 私有状态，只在 useCounter 内部定义

  const doubledCount = computed(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  return { // 暴露给外部的接口
    count,
    doubledCount,
    increment
  };
}

// 在组件中使用
// import { useCounter } from './useCounter';
// setup() {
//   const { count, doubledCount, increment } = useCounter(); // 内部的 count 变量被闭包捕获
//   return { count, doubledCount, increment };
// }
```


-----

## 闭包的优缺点

### 优点：

  * **数据私有化/封装：** 保护数据不被外部随意访问和修改。
  * **状态持久化：** 延长局部变量的生命周期，使其在函数外部也能被访问和修改。
  * **模块化：** 构建更清晰、可维护的代码结构。
  * **函数柯里化/高阶函数：** 灵活地创建和组合函数。

### 缺点：

  * **内存消耗：** 由于闭包会持有外部作用域的引用，导致这些作用域中的变量不会被**垃圾回收**，可能会增加内存开销。如果闭包使用不当，可能导致**内存泄漏**。
  * **调试复杂：** 闭包的变量在外部作用域中，有时在调试时查看其值会稍微复杂一些。

-----

