---
title: 异步编程：从异步I/O模型到协程
date: 2025-08-15
tags:
  - 异步编程
---
# 异步编程：从异步I/O模型到协程

最近准备用 `FastAPI` 写毕设工作的后端，之所以选他是因为自带`swagger` 支持，也有类型系统，之前写过一些，体验还不错。今天在翻看 FastAPI 的官方文档时，发现一个将并发讲的有声有色的文档。[并发 async / await - FastAPI](https://fastapi.tiangolo.com/zh/async/)

JS 中有  async/await, python 中也有，理解不同语言之间面对某些问题的相似性处理，必然有助于进一步理解不同语言处理同样问题的通用解决方案。

> Python 的现代版本支持通过一种叫"协程"(`async` 和 `await` 语法)的东西来写”异步代码“。

## I/O 操作

广义上的 I/O （Input/Output）指的是**计算机系统与外部世界之间的数据交互**，就是计算机从外部设备获取数据（输入），或向外部设备发送数据（输出）的过程。

代码中的 I/O 操作就是，**程序**与外部世界的数据交互，对于程序而言，他的外部世界就包括文件系统、网络、键盘、其他程序等等，下面主要以代码中的 I/O 进行说明。

`c = a + b`这样的简单任务不是 `I/O`操作

网络请求就是一个 `I/O` 操作，当你在代码中发起一个请求，数据需要从内存经过操作系统内核进行数据包的包装和发送，比如经过应用层、传输层、网络层、链路层、物理层等等一步步**包装过程**最终才得以发出。

可以看到，`I/O` 操作的两大特征就是 **外部数据交互**  **操作系统内核参与**

常见的`I/O`任务包括：
- 程序通过网络发送数据
- 程序通过网络接受数据
- 程序读取本地文件（本质是让操作系统读取磁盘文件内容再供给程序）
- 程序写入本地文件（同理）
- API 远程调用 (RPC)
- 数据库操作

## 异步

I/O 操作是程序性能的**主要瓶颈**之一。

CPU 的运行速度非常快，以纳秒（10−9 秒）为单位。而 I/O 操作，比如从硬盘读取数据，速度则慢得多，可能需要毫秒甚至更长。这种巨大的速度差异意味着，如果程序在执行 I/O 操作时“傻傻地”等待，那么 CPU 就会长时间空闲，导致程序运行效率低下。

为了解决这个问题，编程语言和操作系统提供了多种处理 I/O 的模型：

- **同步 I/O（Synchronous I/O）：** 这是最简单的模型。当程序发起一个 I/O 请求（比如 `file.read()`）后，它会**暂停执行**，直到数据读取完毕后才会继续。
    
- **异步 I/O（Asynchronous I/O）：** 这种模型允许程序发起 I/O 请求后**立即返回**，并继续执行其他任务。当 I/O 操作完成后，系统会通过回调、事件或通知来告诉程序。这在需要处理大量并发连接（如网络服务器）时非常有用。

落实到编程语言的**异步代码**上，异步代码意味着**编程语言**可以告诉**计算机程序**在代码中的某个点，它(程序)不需要等待某个任务(T)完成，可以先做其他事情。当任务 T 完成时，它(程序)再执行依赖 T 执行结果的代码(回调)。

在大多数 Web 应用的场景下，服务器会收到来自不同客户端，不同网络条件下发过来的请求，必须要有这样的异步机制。
## async / await

现代版本的 Python 有一种非常直观的方式来定义异步代码。这使它看起来就像正常的"顺序"代码，并在适当的时候"等待"，基本和 JS 的 async / await 语法类似。

当有一个操作需要等待才能给出结果，且支持这个新的 Python 特性时，你可以编写如下代码：

`burgers = await get_burgers(2)`

这里的关键是 `await`。它告诉 Python 它必须等 ⏸ `get_burgers(2)` 完成它的工作 🕙 ，然后将结果存储在 `burgers` 中。**这样，Python 就会知道此时它可以去做其他事情 🔀 ⏯ （比如接收另一个请求）。**

> 注意，所谓`await` 并不是告诉 `python` 要一直在那傻傻地等任务完成。而是告诉 python 这部分代码在这里**暂停**，先去干别的，**当** `get_burgers(2)` 完成了再回来把结果存在 `burgers` 中

要使 `await` 工作，它必须位于`async`函数内

```python
async def get_burgers(number: int):     
	# Do some asynchronous stuff to create the burgers    
	return burgers
```

使用 `async def`，Python 就知道在该函数中，它将遇上 `await`，并且它可以"暂停" ⏸ 执行该函数，直至执行其他操作 🔀 后回来。

类比 JS ，我们就可以猜想，`async function`对应了 `*function`，声明了一个`generator`函数，`await` 就对应了一个 `yield` 操作符，控制程序的暂停执行。 

## 协程

协程是异步编程中的关键技术
### 概念

> 协程是一种**用户态**的**轻量级**线程，它由程序自己调度，不需要操作系统内核接入，这意味着协程的切换、调度非常快。

### Async / Await -- 自动化协程

**在 JS 中的实现：**

- 在 JS 中的表现为一个可以**暂停和恢复执行**的函数。
- `generator / yield` 是协程的实现语法。
- async / await 是基于 `generator / yield` 的高级语法糖


为了解决 `generator` 在处理异步时的麻烦，JavaScript 引入了 `async/await`。它在底层依然使用了 `generator` 的机制，但做了两件重要的事情：

1. **自动化执行**：`async` 函数的执行流不再需要你手动调用 `next()`。
    
2. **内置对 Promise 的支持**：`await` 关键字专门用来等待一个 Promise 对象的解决。当 `await` 遇到一个 Promise 时，它会自动暂停执行，直到 Promise 得到结果。

async / await 是实现自动化调用和 promise 支持的呢
- 一个 async 函数会变成一个 generator 函数
- await 会变为 yield
- 外层由一个 Promise 包装器控制自动执行

```js
// 原始函数
async function greet() { 
	const result = await Promise.resolve('Hello'); 
	return result + ' World'; 
}
```

```js
// 自动执行器，接收一个Generator函数
function asyncToGenerator(generatorFunc) {
  return function() {
    const generator = generatorFunc.apply(this, arguments);
	// 整体返回一个 promise，控制函数的返回值
    return new Promise((resolve, reject) => {
      // 基于 generator.next 递归调用
      function step(nextResult) {
        // 递归终止条件，done === true
        if (nextResult.done) {
          return resolve(nextResult.value);
        }
		// 包装兼容，处理 yield 普通值或promise的情况 
        Promise.resolve(nextResult.value).then(
          res => {
            step(generator.next(res));
          },
          err => {
            step(generator.throw(err));
          }
        );
      }
      step(generator.next());
    });
  };
}
// 被转译后的 greet 函数
const greet = asyncToGenerator(function*() {
  const result = yield Promise.resolve('Hello');
  return result + ' World';
});
```