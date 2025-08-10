---
title: 异步编程：Promise 核心理念
date: 2025-07-11
tags:
  - Promise
---

> 异步编程

## 异步编程

ES6 之前，所有异步场景都**依赖于回调函数**实现

```js
function ajax(url, callback) {
  setTimeout(() => {
    callback(url);
  }, 1000); // 模拟异步操作
}

ajax('https://api.example.com/data', (data) => {
  console.log(data);
});
```

痛点，有多个异步操作，并且有先后顺序, 就会出现**回调地狱**

```js
function ajax(url, callback) {
  // ...
  return result;
}

ajax('https://api.com/data1', (data1) => {
  console.log(data1);
  ajax('https://api.com/data2', (data2) => {
    const result = data1 + data2;
    console.log(result);
    ajax('https://api.com/data3', (data3) => {
      const result2 = result + data3;
      console.log(result2);
    });
  });
});
```

## Promise 核心理念

### Promise A+ 规范

1. 每一个异步任务，在 JS 中应该表现为一个**任务对象**，称之为 Promise 对象

2. 每个任务对象包含**两个阶段**(unsettled、settled)、**三种状态**(pending、fulfilled、rejected)

   - 阶段不可逆，总是从 unsettled 到 settled 阶段
   - 状态不可逆，总是从 pending 到 fulfilled 或 rejected 状态

3. resolve(data) 与 reject(reason)

   - resolve 表示从 pending 到 fulfilled 状态, 可携带一个数据
   - reject 表示从 pending 到 rejected 状态，可携带一个任务失败原因

4. 可以针对任务进行后序处理，onFulfilled(data) 与 onRejected(reason)

### Promise API

ES6 提供了符合 Promise A+ 规范的 Promise API

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success');
  }, 1000);
});
```

## 链式调用

当多个异步任务之间有依赖关系时，通过链式调用，可以实现**串行**执行。

核心：

1. **后处理任务是一个新的异步任务** then/catch/finally 都会返回一个新的 Promise 对象

2. **后处理任务的状态**
   - 如果没处理(比如上一层报错，这一层没 catch，或上一层正常 resolve，这一层只写了 catch)，那新任务的**状态和数据与上一任务一致**
   - 如果处理了，一开始是 pending 等上一层 settled，执行了，那状态和数据取决于具体实现，数据是返回值
   - 如果处理了并且**返回一个 Promise**，那这个新任务的状态就是这个 Promise 的具体实现

3. **基于下面几个题目的常考题总结**：
   - 链式调用可以拆为p1,p2. ..等**单独promise来分析**
   - 链式调用的返回值是**最后一个**then/catch/finally的返回值
   - **知错能改**是好事，但是如果**改错了**，那就不好了！
   - 真假错误：**return** new Error() 与 **throw** new Error()

```js
// 下面这个题可以有很多变数，主要是理解 处理任务的状态 到底是取决于什么
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
const p2 = p1. then((data) => {
  console.log(data);
  return data + 1;
});
const p3 = p2. catch((e) => {
  console.log(e);
});
const p4 = p2. then((data) => {
  console.log(data);
});

console.log(p1, p2, p3, p4);
setTimeout(() => {
  console.log(p1, p2, p3, p4);
}, 2000);
// 打印顺序
// console.log 的 4 pending
// p2 的 1
// p4 的 2
// fulfiiled[1, 2, 2, undifined]

// 注意：
// p3因为没处理，所以他的状态和数据与p2一致，<fulfilled 2>
// p4因为处理了，状态和数据取决于处理逻辑和返回值，无返回值，无错误代码，<fulfilled undefined>
```

---

```js
// 改为链式调用再看看呢
const p = new Promise((resolve, reject) => {
  resolve(1);
})
  .then((res) => {
    console.log(res);
    return 2;
  })
  .catch((err) => {
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

setTimeout(() => {
  console.log(p);
}, 100);

// 1  =第一个.then=   其返回的promise为<fulfilled 2>
//    =第二个.catch=  其返回的promise为<fulfilled 2>
// 2  =第三个.then=   其返回的promise为<fulfilled undefined>
// 最后定时器中p的值为链式调用结尾的返回值，打印 <fulfilled undefined>
```

---

```js
// 有错就改是好事！可以让catch返回fulfilled的promise；但是如果改错了，那就不好了！仍然是rejected
new Promise((resolve, reject) => {
  resolve();
})
  .then((res) => {
    console.log(res.toString());
    return 2;
  })
  .catch((err) => {
    return 3;
  })
  .then((res) => {
    console.log(res);
  });

// 分析
// p1 fulfilled <undefined>
// p2 rejected <'undefined don`t have toString method'>
// p3 fulfilled <3>  // 知错就改也是fulfilled!
// p4 fulfilled <undefined>

// 注意：console.log(res.toString()) 被捕获了，不会打印任何东西
// 打印结果，单走一个3
// 3
```


## 注意

1. new Promise(executor) 中，executor 是**同步**执行的！

   ```js
   new Promise((resolve, reject) => {
     console.log('hehehe');
     reject(1);
     // resolve(1)
     console.log('hahaha'); // 无论reject还是resolve，hehehe,hahaha都会同步执行打印
   });
   ```

2. 链式调用, 返回新的 Promise，其回调函数是**异步**执行的！
   ```js
   const a = new Promise((resolve, reject) => {
     reject(1);
   }).catch(() => {});
   console.log(a);
   // 我不加then或者catch的时候，a直接打印fulfilled 1，加了之后打印pending?

   // 为什么呢？是因为链式调用返回了新的Promise对象，这个对象的初始状态是pending
   // then catch finally，都会返回一个新的Promise对象
   // Promise对象在 settled 后会*异步*地调用后处理程序, 所以在打印的时候，这个新的Promise对象的状态是pending，下一个tick会打印fulfilled 1
   ```


3. 状态不可逆

   ```js
   new Promise((resolve, reject) => {
     resolve(1);
     reject(2);
     resolve(3);
   });

   new Promise((resolve, reject) => {
     resolve(1);
     resolve(2);
   });
   ```

4. Promise链式调用需多回顾




## Promise 静态方法

### Promise.all

可以把.all理解为allFulfilled
* 当所有都fulfilled时，才fulfilled，值为数组中所有fulfilled的数组
* 只要有一个rejected，返回的promise就rejected，值为**第一个rejected**的值

```js

const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = 3 // 普通值
const p4 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(4)
    }, 200);
})
const p5 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('my err1')
    }, 100);
})
const p6 = Promise.reject('my err2')

const res1 = Promise.all([p1, p2, p3, p4]) 
const res2 = Promise.all([p1, p2, p3, p4, p5])

setTimeout(() => {
    console.log(res1) // state: 'fulfilled' result: [1,2,3,4]
    console.log(res2) // state: 'rejected' result: "my err2" (注意是第一个rejected的值)
}, 500);

```


### Promise.allSettled

就是不管fulfilled还是rejected，当所有都settled时，返回的promise才fulfilled，值为数组中所有settled的数组

```js
const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = 3 // 普通值会被包装成Promise.resolve(val)
const p4 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(4)
    }, 200);
})
const p5 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('my err1')
    }, 100);
})
const p6 = Promise.reject('my err2')

const res1 = Promise.allSettled([p1, p2, p3, p4]) 
const res2 = Promise.allSettled([p1, p2, p3, p4, p5, p6])

setTimeout(() => {
    console.log(res1) 
    // state: 'fulfilled' 
    // result: [
    //     {"status": "fulfilled", "value": 1},
    //     {"status": "fulfilled","value": 2},
    //     {"status": "fulfilled","value": 3},
    //     {"status": "fulfilled", "value": 4},
    // ]
    console.log(res2) 
    // state: 'fulfilled' 
    // result: [
    //     {"status": "fulfilled", "value": 1},
    //     {"status": "fulfilled","value": 2},
    //     {"status": "fulfilled","value": 3},
    //     {"status": "fulfilled", "value": 4},
    //     {"status": "rejected", "reason": "my err1"},
    //     {"status": "rejected", "reason": "my err2"}
    // ]
}, 500);

```

### Promise.any
   
当数组中出现了**第一个fulfilled**的promise，则返回的promise就吸收自该fulfilled的promise，其状态和值相同
如果**全部都是rejected**，则返回的promise就rejected，值为一个对象，其中errors存储了所有rejected的reason
   
```js

 const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    }, 300);
})
const p4 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(4)
    }, 200);
})
const p5 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('my err1')
    }, 100);
})
const p6 = Promise.reject('my err2')

const res1 = Promise.any([p1, p4, p6])
const res2 = Promise.any([p1, p4, p5, p6])
const res3 = Promise.any([p5, p6])

setTimeout(() => {
    console.log(res1) // state: 'fulfilled' reuslt: 4

    console.log(res2) // state: 'fulfilled' reuslt: 4

    console.log(res3)
    // state: 'rejected'
    // result: {
    //   errors:['my err1', 'my err2']
    //   message: 'All promises were rejected'
    //   stack: 'AggregateError: All promises were rejected'
    //}
}, 500);

```

### Promise.race

当数组中出现了**第一个settled**的promise，则返回的promise就吸收自该settled的promise，其状态和值相同

```js
const p1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1)
    }, 300);
})
const p4 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(4)
    }, 200);
})
const p5 = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject('my err1')
    }, 100);
})
const p6 = Promise.reject('my err2')

const res1 = Promise.race([p1, p4])
const res2 = Promise.race([p1, p4, p5, p6])
const res3 = Promise.race([p5, p6])

setTimeout(() => {
    console.log(res1) // state: 'fulfilled' result: 4

    console.log(res2) // state: 'rejected' result: 'my err2'

    console.log(res3) // state: 'rejected' result: 'my err2'
}, 500);

```



| api | 参数 | 返回的promise的状态 |
| --- | --- | --- |
| Promise.all | 一个数组，可包含普通值和promise | 当**所有都fulfilled时**，才fulfilled，值为数组中所有fulfilled的数组，否则返回的promise就rejected，值为数组中第一个rejected的值 |
| Promise.allSettled | 一个数组，可包含普通值和promise | 当**所有都settled时**，才fulfilled，否则返回的promise就rejected |
| Promise.any | 一个数组，可包含普通值和promise | 当**有一个fulfilled时**，就fulfilled，否则返回的promise就rejected |
| Promise.race | 一个数组，可包含普通值和promise | 当**有一个settled时**，就fulfilled或rejected |
| Promise.resolve | 一个值 | 直接返回一个fulfilled的promise |
| Promise.reject | 一个值 | 直接返回一个rejected的promise |


## 消除回调的 Async/Await

有了 Promise 后，异步任务有了标准统一的处理范式，在 ES7，官方推出了 Async/Await 语法，进一步简化了异步编程的写法。

### async

async 修饰的函数，返回一个 promise 对象，函数内部可以使用 await 关键字。
函数的返回值相当于 resolve 的值，也就是 fulfilled 状态的值   
如果函数执行错误，返回一个 rejected 状态的 promise，reject 的值是错误信息
   
注：以下四个函数`foo`,`_foo`,`__foo`,`___foo`的返回值**相同**

```js
async function foo() {
  return 'hello world'; 
}

function _foo() {
  return new Promise((resolve, reject) => {
    resolve('hello world');
  });
}

// 外层添加了async修饰，内层返回promise，这种情况下，不会返回一个resolve(promise)的promise，返回的就是内部的这个promise
async function __foo() {
  return new Promise((resolve, reject) => {
    resolve('hello world');
  });
}

async function ___foo() {
  return Promise.resolve('hello world');
} 
```

### await

await 只能出现在 async 函数中，不能单独使用

有个奇技淫巧，就是用立即执行函数包裹 async 函数，然后使用 await 关键字，但是这种写法不推荐，因为这种写法会导致代码难以阅读和维护。

```js
(async () => {
  // const res = await foo();
  const res = await 1; // 相当于 await Promise.resolve(1)
  console.log(res);
})();
```


