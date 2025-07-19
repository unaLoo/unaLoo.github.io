---
title: '异步编程（二）：迭代器与生成器'
date: 2025-07-16
tags:
  - Promise
---

> 迭代器与生成器
---

## 迭代器

### 迭代器协议和原理

针对 Array,Object,Map,Set 等表示集合的数据解构，需要有统一的接口机制，应对不同数据解构的遍历迭代需求。

**迭代器**是一种行为规范接口，主要供 for...of,解构赋值等语法消费。

任何数据结构只要具备 Iterator 接口，就可以完成遍历操作。一个对象如果想成为“可迭代的”（Iterable），它就必须实现**迭代器协议**。

- ES6 规定，默认的 Iterator 接口部署在数据结构的`Symbol.iterator`属性。
- 该 `Symbol.iterator` 方法被调用时，返回一个**迭代器**。
- 迭代器对象必须有一个 `next()` 方法。
- `next()` 方法每次调用时，返回一个包含 `value` 和 `done` 属性的对象：
  - `value`：序列中的当前值
  - `done`：布尔值，表示遍历是否完成

```js
// 迭代器的模拟实现
var it = makeIterator(['a', 'b']);
it.next(); // { value: "a", done: false }
it.next(); // { value: "b", done: false }
it.next(); // { value: undefined, done: true }
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function () {
      return nextIndex < array.length
        ? { value: array[nextIndex++], done: false }
        : { value: undefined, done: true };
    },
  };
}
```

### 迭代器支撑应用

**迭代器支撑的消费应用：**

- for...of
- Array.from
- Map(), Set(),WeakMap(),WeakSet() 以数组为参数
- Promise.all, Promise.race, Promise.allSettled, Promise.any

---

**原生具备 Iterator 接口的数据结构：**

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象,NodeList 对象 这种类数组对象

```js
const arr = [1, 3, 5, 7, 9];
const _arr2 = [...arr]; // 利用迭代器展开

const iterator = arr[Symbol.iterator]();
const arr2 = [];
let v = iterator.next();
console.log(v);
while (!v.done) {
  arr2. push(v.value);
  v = iterator.next();
}
console.log(arr2);
```

---

**计算生成的迭代器：**

- entries()
- values()
- keys()

---

Set 原生具备 Iterator 接口，可以被 for...of 遍历,也可以被 Array.from 转换为数组
set.entries() 返回一个迭代器，每个元素是一个[element,element]数组
set.values() 返回一个迭代器，每个元素是一个 element
set.keys() 返回一个迭代器，每个元素是一个 element

---

Map 原生具备 Iterator 接口，可以被 for...of 遍历,每个元素是一个[key,value]数组
map.entries() 返回一个迭代器，每个元素是一个[key,value]数组
map.values() 返回一个迭代器，每个元素是一个 value
map.keys() 返回一个迭代器，每个元素是一个 key

---

## 生成器

### 基本概念

Generator 函数是 ES6 提供的一种异步编程解决方案, Generator 函数是一个状态机, 还是一个遍历器对象生成函数，返回的遍历器可以遍历内部的状态。

语法上，通过 `function*` 语法定义（注意函数名后的星号），并在函数体内部使用 `yield` 关键字来暂停执行并返回一个值。

- 生成器函数被调用时，返回一个指向内部状态的遍历器对象。
- Generator 是分段执行的，`yield`表达式是暂停执行的标记，而`next`方法可以恢复执行。
- Generator 内部的执行顺序
  1. 遇到 `yield` 表达式，就暂停执行后面的操作，并将紧跟在 `yield` 后面的那个表达式的值，作为返回的对象的 `value` 属性值。
  2. 下一次调用 `next` 方法时，再继续往下执行，直到遇到下一个 `yield` 表达式。
  3. 如果没有再遇到新的 `yield` 表达式，就一直运行到函数结束，直到 `return` 语句为止，并将 `return` 语句后面的表达式的值，作为返回的对象的 `value` 属性值。
  4. 如果该函数没有 `return` 语句，则返回的对象的 `value` 属性值为 `undefined`。

```js
function* oneDigitPrimes() {
  yield 2;
  yield 3;
  return 'ok';
}
const primes = oneDigitPrimes();
console.log(primes); // generator object, 也是迭代器对象

console.log(primes.next()); // {  value: 2, done: false }
console.log(primes.next()); // {  value: 3, done: false }
console.log(primes.next()); // {  value: 'ok', done: false }
console.log(primes.next()); // {  value: undefined, done: false }
console.log(primes.next()); // {  value: undefined, done: false }
```

### 应用场景

**a. 处理异步操作，改写回调函数**
可以把异步回调操作放在`yield`表达式后面，从而实现异步操作的同步表达。

```js
let it = main();
function* main() {
  var result = yield request('http://some.url');
  var resp = JSON.parse(result);
  console.log(resp.value);
}
function request(url) {
  makeAjaxCall(url, function (response) {
    it.next(response); // 在这里去调next
  });
}
it.next();
```

**b. 控制流管理**

```js
Promise.resolve(step1)
  .then(step2)
  .then(step3)
  .then(step4)
  .then(
    function (value4) {
      // Do something with value4
    },
    function (error) {
      // Handle any error from step1 through step4
    }
  )
  .done();
```

```js
function* main(value) {
  try {
    let result = yield step1(value);
    let result2 = yield step2(result);
    let result3 = yield step3(result2);
    let result4 = yield step4(result3);
    console.log(result4);
  } catch (error) {
    console.log(error);
  }
}
```

**c. 部署 Iterator 接口(让任意对象可迭代)**

```js
function* makeObjectIterable(obj) {
  for (let key in obj) {
    yield [key, obj[key]]; // [key, value]
  }
}
```

### 带参数的 next 方法

这个规则有点变态。
yield 表达式本身没有返回值，或者说总是返回 undefined。
next 方法可以**带一个参数**，该参数就会被当作**上一个 yield 表达式的返回值**

```js
function* foo(x) {
  var y = 2 * (yield x + 1);
  var z = yield y / 3;
  return x + y + z;
}
var a = foo(5);
a.next(); // Object{value:6, done:false}   // yield 6; y = 2 * undefined = NaN
a.next(); // Object{value:NaN, done:false} // NaN / 3 = NaN, yield NaN, z = undefined
a.next(); // Object{value:NaN, done:true} // return 5 + NaN + undefined = NaN
var b = foo(5);
b.next(); // { value:6, done:false }  // yield 6
b.next(12); // { value:8, done:false } // y = 2 * 12(把12当作上一个yield的返回值) = 24, yield 24 / 3 = 8
b.next(13); // { value:42, done:true } // z = 13(把13当作上一个yield的返回值) , return 5 + 24 + 13 = 42
```

### yield 表达式, 在生成器内调用另一个生成器

```js
// 用生成器实现数组去重
function* flat(arr) {
  for (let item of arr) {
    if (Array.isArray(item)) {
      yield* flat(item);
    } else {
      yield item;
    }
  }
}

const arr = [1, [[2, 3], 4], [5, 6]];
const iterator = flat(arr);
const flatten = [...iterator];
console.log(flatten);
```




---


## 应用：写一个makeIterator函数

```js
const obj = {
    a: 'alpha',
    b: 'beta',
    c: 'cigma'
}

// for (const val of obj) {
//     console.log(val)
// }
// 直接遍历报错：TypeError: obj is not iterable

function makeObjIterabel1(obj) {
    // 直接实现迭代器
    obj[Symbol.iterator] = function () {
        let keys = Object.keys(obj)
        let index = 0
        return {
            next: () => {
                if (index >= keys.length) return {
                    value: undefined,
                    done: true
                }

                let key = keys[index++]
                return {
                    value: [key, obj[key]],
                    done: false
                }
            }
        }
    }
}

function makeObjIterabel2(obj) {
    // 使用生成器
    function* help() {
        for (let key of Object.keys(obj)) {
            yield [key, obj[key]]
        }
    }
    obj[Symbol.iterator] = help
}
// makeObjIterabel1(obj)
makeObjIterabel2(obj)
for (const val of obj) {
    console.log(val)
}
```


## 小结

**Generator 和 Iterator 的关系**

- **Generator** 是 **Iterator** 的一种便捷实现方式。
- **Iterator** 是一种抽象协议：定义了遍历的规则（有 `next()` 方法，返回 `{ value, done }`）。
- **Generator** 是具体的工具/语法糖：提供简洁优雅的方式来编写遵循迭代器协议的代码，同时，因为其状态机特性，可以实现复杂的控制流。

**在 Generator 中，yield 和 next 的配合**

- yield 负责**暂停**和**产出值**。它决定了 **next().value** 的内容。
- next() 负责**驱动**和包装。它使生成器继续执行，并将 yield 产出的值**包装**在 { value: ..., done: ... } 这样的对象中返回
