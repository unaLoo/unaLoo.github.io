---
title: 'JavaScript Promise'
date: 2025-06-10
tags:
  - JavaScript
---

> Promise 是 JavaScript 中处理异步操作的一种机制，它提供了一种更优雅、更直观的方式来处理异步任务，避免了回调地狱的问题。本文将深入探讨 Promise 的原理、常用API及其应用场景以及与事件循环的关系



## 一、简单回顾 [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Promise 是 JavaScript 中用于表示**异步操作最终完成或失败**及其**结果值**的对象。

以下将其特性总结为四个：三种状态、链式调用、微任务、async/await。
 
### 三种状态
- Promise 代表一个创建时未知，**未来才会结束**的操作结果。
- Promise 基于三种状态：`pending`、`fulfilled`、`rejected`。可以为 Promise 注册回调函数，在操作完成或失败时执行。

### 链式调用（Promise chaining）
- 链式调用可以避免回调地狱（callback hell）的问题，使代码更清晰易读。
   
- 连续的 .then() 调用就像一个“数据管道”，前一个 .then() 的返回值会传递给下一个 .then()。

- 如果上一个 .then() 返回的是一个 Promise，下一个 .then() 会等待这个 Promise 异步完成，再继续执行。
  
- 如果上一个 .then() 返回的是一个 普通值（非 Promise），下一个 .then() 会 立即把该值封装为 Promise.resolve(...)，然后**进入微任务队列异步执行** —— 不是同步执行 ❗️

- 如果上一个 .then() 抛出异常或返回的是 Promise.reject(...)，则下一个 .then() 不会执行，而会进入下一个 .catch() 或 .then(undefined, onRejected)。

- 每个 .then() 都是异步执行的，即使前一个 .then() 是立即返回普通值。


### 微任务（Microtask）

Promise 的回调（then/catch/finally）会在**微任务队列**（microtask queue）中执行，优先于 setTimeout 等宏任务。

```js
  console.log('start');
  Promise.resolve().then(() => console.log('promise'));
  setTimeout(() => console.log('timeout'));
  console.log('end');
  // start → end → promise → timeout
```

### async/await

`async/await` 是 Promise 的语法糖 + 控制流改进，使异步代码看起来像同步代码，提升可读性和可维护性。

```js

  async function demo() {
    const x = await fetchSomeData();
    console.log(x);
  }

  function demo(){
    return new Promise((resolve, reject) => {
      fetchSomeData().then(x => {
        console.log(x);
        resolve();
      })
    })
  }

  function demo() {
    return Promise.resolve().then(() => {
      return fetchSomeData();
    }).then(x => {
      console.log(x);
    });
  }
```







## 二、Promise : 使用

#### 1. Promise基本使用

```js
  // 创建
  const promise = new Promise((resolve, reject) => {
    // 异步操作
    if (/* 成功 */) {
      resolve(value); // 变为 fulfilled
    } else {
      reject(error); // 变为 rejected
    }
  });

  // 使用
  promise
    .then(result => {
      // 成功时执行
      // then也可以有第二个参数 onRejected，用于处理失败
    })
    .catch(error => {
      // 失败时执行
    })
    .finally(() => {
      // 总会执行
    });
```
---


```js
  // 加载图片
  function imgLoad(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = url;
    });
  }

  imgLoad('https://example.com/image.png')
    .then(img => {
      document.body.appendChild(img);
    })
    .catch(error => {
      console.error(error);
    });
```
   
#### 2. 常用静态方法

**`Promise.resolve(value)`**：返回一个fulfilled的 Promise，基本等价于 `new Promise(resolve => resolve(value))`

应用场景：
- 将普通值转换为 Promise
- 统一返回 Promise 对象

我自己通常会疑惑：`Promise.resolve(1)` 和 `new Promise(resolve => resolve(1))` 有什么区别？
> 两者最终都会返回一个状态为 fulfilled（已兑现）、值为 1 的 Promise 对象
> 但 `Promise.resolve(1)` 是立即创建一个已完成的Promise并放入微任务队列
> 而 `new Promise(resolve => resolve(1))` 是先同步执行构造函数体，再进入微任务队列

```js
  console.log('A');
  Promise.resolve(1).then(() => console.log('B'));
  new Promise(resolve => {
    console.log('C');
    resolve(1);
  }).then(() => console.log('D'));
  console.log('E');
  // A → C → E → B → D
```

---

**`Promise.all([p1, p2, ...])`**：全部成功才成功，有一个失败就失败

应用场景： 
- 合并多个 Promise 结果
- 并发请求多个接口

  ```js
    Promise.all([
      fetch('/user'),
      fetch('/comments'),
      fetch('/likes')
    ])
      .then(([userRes, commentRes, likeRes]) => {
        // do something
      })
  ```

---


**`Promise.race([p1, p2, ...])`**：第一个完成（成功或失败）就返回

应用场景
- 超时处理
- 多个接口请求竞速（这有啥场景？）

  ```js
  // 超时处理
  Promise.race([
    fetch('/user'),
    new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), 1000))
  ]).then(userRes => {
    // do something
  }).catch(error => {
    // handle timeout
  });
  ```

---
**`Promise.allSettled([p1, p2, ...])`**：全部结束后返回每个结果

应用场景
- 部分失败也可接受, 比如批量上传，不能因为一个失败就全部失败
  ```js
    const uploadFiles = files.map(file => uploadFile(file)); // 每个是一个 Promise

    Promise.allSettled(uploadFiles).then(results => {
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      console.log('成功的文件：', successes.map(r => r.value));
      console.warn('失败的文件：', failures.map(r => r.reason));
    });
  ```

- 对多个要素进行并行的模型计算，成功的结果留下，失败的重试
  ```js
    const modelTasks = features.map(feature => runModel(feature));
    Promise.allSettled(modelTasks).then(results => {
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      console.log('成功的任务：', successes.map(r => r.value));
      console.warn('失败的任务：', failures.map(r => r.reason));
      // 重试失败的任务
    });
  ```


---
**`Promise.any([p1, p2, ...])`**：有一个成功就成功，全部失败才失败

应用场景
- 多个接口返回的结果都OK，用最快fulfilled的那个即可（CDN备份请求）

  ```js
    Promise.any([
      fetch('https://cdn1. example.com/data.json'),
      fetch('https://cdn2. example.com/data.json'),
      fetch('https://cdn3. example.com/data.json')
    ]).then(result => {
      console.log('有一个成功就用了');
    }).catch(() => {
      console.error('都失败了');
    });
  ```

#### 3. Promise高级应用场景

🔶 **并发控制/Promise并发池/限流**
- 比如:需要上传100个文件，不应该同时上传，而是分批上传，每次上传一组，上传完一组再上传下一组，直到上传完所有文件。

  ```js
    // 手写要点总结：
    // 1. 既然有concurrency，那就要有activeCount，当 activeCount < concurrency 时，就执行任务
    // 2. 需要有下标 cur 来记录当前执行到哪个任务，每个任务的返回结果要基于下标来存储， 不能直接push

    function limitedPool(tasks, maxConcurrency = 4) {
      const results = []
      let cur = 0
      let activeCount = 0

      return new Promise((resolve, reject)=>{

        const runNext = ()=>{
          if(cur === tasks.length && activeCount === 0) return resolve(results)

          while(activeCount < maxConcurrency && cur < tasks.length){
            
            const curentIndex = cur++
            const task = tasks[curentIndex]

            activeCount++

            Promise.resolve(task())
              .then(res =>{
                results[curentIndex] = res
              })
              .catch(err=>{
                results[curentIndex] = err
              })
              .finally(()=>{
                activeCount--
                runNext()
              })
          }
        }
        runNext()
      })

    }

    const tasks = Array.from({ length: 10 }, (_, i) => () => fetch(`/api/${i}`));
    limitedPool(tasks, 3).then(res => console.log(res));



  ```


🔶 **重试机制**
- 比如: 请求接口失败，自动重试，重试3次，如果3次都失败，则放弃。

  ```js 
    function withRetry(fn, times) {

        return new Promise((resolve, reject) => {

            let count = 0
            const run = () => {

                Promise.resolve(fn()).then(res => {
                    resolve(res)
                }).catch(err => {

                    console.log('retry count:', count)
                    if (++count === times) reject(err)
                    run()
                })
            }

            run()
        })
    }

    const errFn = () => {
        return new Promise((resolve, reject) => {
            console.log('run fn')
            setTimeout(() => {
                reject('err')
            }, 1000);
        })
    }

    withRetry(errFn, 3).then((res) => console.log(res))

  ```

🔶 **超时处理**
- 比如: 请求接口超时，自动放弃，超时时间10秒，如果10秒后还没返回，则放弃, 这里之前的Promise.race() 可以实现，这里再撸一遍

  ```js
    function dontOutTime(fn, timeLimit) {
        return Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('超时Error')), timeLimit))
        ])
    }

    function func() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(100)
            }, 999);
        })
    }

    dontOutTime(func, 1000)
        .then(res => console.log(res))
        .catch(err => console.log(err))

  ```



🔶 **任务队列/串行**
- 比如：需要先请求接口A，再请求接口B，再请求接口C, 这种用async/await 最直观

  ```js
    async function apiA(){}
    async function apiB(){}
    async function apiC(){}

    async function main(){
      const resA = await apiA()
      const resB = await apiB()
      const resC = await apiC()
    }


  ```


## 三、Promise手写

要点：
- Promise基本结构
  - 维护了一个不可逆的状态`_status`：默认pending、改变时只可能是 `pending -> fulfilled`、`pending -> rejected`
  - 维护了一个`_value`，用于存储结果值或错误信息
  - 维护了一个`_callbacks`，用于存储回调函数，需要支持异步执行，所以需要使用setTimeout模拟异步
  - 对于传入的excutor函数的理解：Promise**内部定义**了`resolve`和`reject`两个函数，供给excutor函数调用，excutor函数内部调用resolve或reject，改变Promise的状态和值

- Promise.prototype.then
  - 要支持链式调用，则需要返回一个新的Promise对象
  - 这个新的Promise对象基于父亲Promise的`_status`和`_value`，调用handle或push回调函数

- Promise.prototype.catch
  - `return this.then(null, onRejected)`


```js
  function MyPromise(excutor) {
      this._status = 'pending'
      this._value = null
      this._callbacks = []

      const resolve = (val) => {
          if (this._status !== 'pending') return
          this._status = 'fulfilled'
          this._value = val

          setTimeout(() => { // 模拟异步
              this._callbacks.forEach(cb => cb.onFulfilled && cb.onFulfilled(val))
          })

      }

      const reject = (val) => {
          if (this._status !== 'pending') return
          this._status = 'rejected'
          this._value = val

          setTimeout(() => {
              this._callbacks.forEach(cb => cb.onRejected && cb.onRejected(val))
          });
      }

      try {
          excutor(resolve, reject)
      }
      catch (e) {
          reject(e)
      }
  }


  MyPromise.prototype.then = function (onFulfilled, onRejected) {

      // 无法支持链式调用，链式调用的核心是把结果包装成新Promise并返回
      // if (this._status === 'fulfilled') {
      //     onFulfilled(this._value)
      // }
      // else if (this._status === 'rejected') {
      //     onRejected(this._value)
      // }
      // else {
      //     this._callbacks.push({
      //         onFulfilled, onRejected
      //     })
      // }

      const self = this // 这里的self是父亲promise

      // 返回新的 Promise 实现链式调用
      return new MyPromise((resolve, reject) => {
          function handle(callback) {
              try {
                  const result = callback(self._value)
                  resolve(result)
              } catch (error) {
                  reject(error)
              }
          }

          if (self._status === 'fulfilled') {
              handle(onFulfilled)
          } else if (self._status === 'rejected') {
              handle(onRejected)
          } else {
              self._callbacks.push({
                  onFulfilled: () => handle(onFulfilled),
                  onRejected: () => handle(onRejected)
              })
          }
      })
  }

  MyPromise.prototype.catch = function (onRejected) {
      return this.then(null, onRejected)
  }

  const promise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
          resolve('OK!')
      }, 500);
  }).then((res) => {
      console.log('拿到', res)
      return '12313'
  }).then((res) => {
      console.log('又拿到', res)
  }).catch(e => {
      console.warn('报错', e)
  })

```




















## 参考资料

- [MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise){target="_blank" rel="noreferrer"}



