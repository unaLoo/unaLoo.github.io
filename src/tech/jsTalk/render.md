---
title: 浏览器的渲染时机
date: 2025-06-12
tags:
  - JavaScript
---
# 浏览器的渲染时机

## 浏览器的渲染过程

从拿到 HTML 开始，一次相对完整的浏览器渲染过程如下所示：

- 解析HTML：拿到HTML文档，开始解析
- 如果遇到 CSS，异步请求CSS和解析CSSOM树，继续解析DOM
	- CSS 不阻塞 DOM 解析
	- 但是阻塞 CSSOM 构建，从而阻塞页面渲染
- 如果遇到 JS 
	- 默认：堵塞DOM解析，请求JS，等JS下载到手后执行JS 再继续解析
	- 如果是 async 属性，那会异步请求，下载完 JS 就立即执行
	- 如果是 defer 属性，那会异步请求，等 DOM 解析完之后才执行，在DOM解析完毕后， 在`DOMContentLoaded` 事件之前执行
- DOM 解析完毕得到 DOM 树，CSS 解析完毕得到 CSSOM 树
- DOM 树和 CSSOM 树合并得到渲染树。
	- 从根开始
	- **计算元素的可见性**，忽略不可见元素（meta, script, link和display:none）
	- **单位变化**属性值会变化到绝对单位，每个结点生成 computedStyle
- Layout布局：计算各个结点的几何信息，盒子模型是布局计算的单位，各种 flex、grid 布局在这一步计算。
- 分层：具有 z-index，3d transform，opacity 等属性的元素单独成层，利于GPU加速
- 绘制和合成：把层的像素信息绘制到位图，合成线程把多个层合成显示到屏幕

当然，在页面加载完毕后，后序的浏览器渲染帧，主要就是从布局和绘制这两块开始了。

## 与事件循环的关系

> **`window.requestAnimationFrame()`** 方法会告诉浏览器你希望执行一个动画。它要求浏览器在下一次重绘之前，调用用户提供的回调函数。
> 
> 对回调函数的调用频率通常与显示器的刷新率相匹配。虽然 75hz、120hz 和 144hz 也被广泛使用，但是最常见的刷新率还是 60hz。

在浏览器环境下，每一轮 **事件循环** 大致包含几个关键阶段：

1. 执行宏任务
    - 如：`setTimeout`、`setInterval`、I/O 回调、script 主体代码
2. 执行所有微任务
    - 如：`Promise.then`、`MutationObserver`
3. 执行 `requestAnimationFrame` 回调
4. 渲染前检查
    - 浏览器决定**是否需要渲染**（不是每一轮都渲染，通常 60Hz → 每 ~16.6ms 一次）
    - 有时候任务量太大，也会降帧渲染
5. 执行渲染管线
	- 计算样式、布局、绘制、分层、合成
6. 进入下一轮事件循环

从上面的流程可以看到，`requestAnimationFrame`并不就意味着渲染了，渲染与否取决于视窗是否变化、DOM 是否变化、CPU 负载等等多因素，下面的例子证明了这一点。

```html
<html>
<head>
    <style>
        div {
            width: 100px;
            height: 100px;
            background: blue;
        }
    </style>
</head>

<body>
    <div></div>
    <script>
        const loop = () => {
            console.log('call')
            requestAnimationFrame(loop)
        }
        loop()
    </script>
</body>
</html>
```

loop 函数一直在每个渲染帧之前被执行。
![](../../assets/Pasted%20image%2020251005223350.png)
然而因为我们没有特殊动画，浏览器在5000ms内只输出了一帧.........
![](../../assets/Pasted%20image%2020251005223835.png)
对比于有动画的时候..........
![](../../assets/Pasted%20image%2020251005224224.png)


## 实例

**案例一：在同步、微任务和宏任务情况下改变DOM样式** 

```html
<html>
<head>
    <style>
        div {
            display: inline-block;
            width: 100px;
            height: 100px;
            background: blue;
        }

        #microTaskDom {
            margin-left: 10px;
        }
    </style>
</head>

<body>
    <div id="taskDom"></div>
    <div id="microTaskDom"></div>
    <button id="change">change</button>
    <button id="reset">reset</button>
    <script>
        document.querySelector("#change")
        .addEventListener('click', e => {
            taskDom.style.background = 'red'
            setTimeout(() => {
                taskDom.style.background = 'black'
            });

            microTaskDom.style.background = 'red'
            Promise.resolve().then(() => {
                microTaskDom.style.background = 'black'
            })
        })

        document.querySelector("#reset")
        .addEventListener('click', e => {
            taskDom.style.background = 'blue'
            microTaskDom.style.background = 'blue'
        })
    </script>
</body>
</html>
```

结果：点击change时，taskDom由蓝先红后黑，microTaskDom直接由蓝变黑

分析：这个例子充分印证了上文提到的浏览器渲染和事件循环的关系
- 第一轮事件循环
	- 执行宏任务（当前script脚本），两者都设置dom为红色
	- 执行微任务，设置dom为黑色
	- 没有raf
	- 因为样式变了，进行一次渲染（此时一红一黑）
- 第二轮事件循环
	- 执行宏任务（定时器中，设置DOM为黑色）
	- 没有微任务
	- 因为样式变了，进行一次渲染（此时两者都为黑色）

---

**案例二：也是在同步、微任务和宏任务情况下改变DOM样式**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
    <table border=1>
        <tr><td><button id='do'>DO</button></td>
            <td><div id='status'>Not Calculating yet.</div></td>
        </tr>
        <tr><td><button id='do_ok'>DO OK</button></td>
            <td><div id='status_ok'>Not Calculating yet.</div></td>
        </tr>
    </table>    
<script>

function long_running(status_div) {
    var result = 0;
    for (var i = 0; i < 1000; i++) {
        for (var j = 0; j < 700; j++) {
            for (var k = 0; k < 1000; k++) {
                result = result + i + j + k;
            }
        }
    }
    document.querySelector(status_div).innerHTML = 'calclation done' ;
}

document.querySelector('#do').onclick = function () {
    document.querySelector('#status').innerHTML = 'calculating....';
    long_running('#status');
};

document.querySelector('#do_ok').onclick = function () {
    document.querySelector('#status_ok').innerHTML = 'calculating....';
    window.setTimeout(function (){ long_running('#status_ok') }, 0);
};

</script>
</body>
</html>
```

其实和上题类似，最终的效果为：
点击 do，`Not Calculating yet.` 等待一段时间后直接变为 `calclation done`
点击 doOK，`Not Calculating yet` 变为 `calculating....` 等待一段时间后变为 `calclation done`