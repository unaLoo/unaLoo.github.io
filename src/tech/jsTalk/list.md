---
title: 大数据列表/卡片的渲染方案
date: 2025-08-09
tags:
  - JavaScript
---
# 大数据列表的渲染方案

长列表渲染是重要的性能优化和用户体验优化手段，在 web 端，一些记录日志模块，数据展示后台需要用到，在移动端更加重要，比如中午我用京东点外卖，划拉划拉着就越来越卡，体验很差。

主流的长列表渲染方案主要有以下几种：
- 分页，缺点是移动端不友好，翻页闪烁
- 懒加载 / 滚动加载，缺点是数据越来越多，渲染性能越来越差
- 虚拟列表，稍复杂，只渲染可视域的元素

## 分页

分页加载是最基础、经典的大数据量渲染方案。

### 总体流程

1. **页面初始化**
    - 页面刚打开时，客户端默认请求 **第1页** 的数据（通常 `page=1`）。
    - 服务端返回这一页的数据和总条数（或总页数）。
    - 前端根据返回结果渲染列表内容和分页控件（按钮等）。
2. **用户切换页码**
    - 用户点击某个页码按钮，前端发送请求带上对应`page`参数。
    - 服务端返回第N页的数据。
    - 前端**清空**当前列表，渲染新页数据。
3. **分页控件更新**
    - 初始加载时一般会生成全部页码按钮（或者部分页码按钮带省略号）。
    - 切换页码时只更新列表内容，分页控件一般保持不变。

### 实现

#### 1‍⃣ 后端服务

这里用 express 搭一个简单的支撑分页的服务。
- 接收 `page` 和 `limit`参数
- 找索引
- 返回总页数、该页数据
```js
/////// MockData //////////////////////////////////
const TotalCount = 300
const data = new Array(TotalCount).fill(0).map((_, i) => ({
    id: i + 1,
    title: `这是第 ${i + 1} 条数据`,
    description: `这是一段描述信息，编号 ${i + 1}`,
}))


/////// HTTP-SERVER //////////////////////////////////
const express = require('express')
const app = express()

app.use(cors()) // CORS

/**
 * GET /api/list?page=18&limit=20
 */
app.get('/api/list', (req, res) => {

    let { page, limit } = req.query
    page = parseInt(page)
    limit = parseInt(limit)

    const totalPages = Math.ceil(TotalCount / limit)
    const startIdx = (page - 1) * limit
    const endIdx = startIdx + limit
    const result = data.slice(startIdx, endIdx)

    res.json({
        page, limit,
        totalPages: totalPages,
        data: result
    })
})

app.listen(3000, () => {
    console.log('server starting on 3000');
})
```

#### 2‍⃣ 前端

**首先是视图层，我们只考虑页面**

两个 div ，一个放列表，一个放页码按钮们，CSS 就不放了
```html
    <div class="container"> </div>
    <div class="btns"> </div>
```

然后是视图更新方法，我们需要基于页数添加 `button`，还需要基于条目数据添加列表项目。

```js
function updateBtns(pageCount){
	// 采用文档片段减少直接的DOM操作
	const fragment = document.createDocumentFragment()
	for (let i = 0; i < pageCount; i++) {
		// 构建 DOM 
		const btn = document.createElement('button')
		// 这里采用自定义属性绑定了该按钮代表的页数
		btn.setAttribute('data-page', i + 1)
		btn.innerText = `第${i + 1}页`
		fragment.appendChild(btn)
	}
	btns.innerHTML = ''
	btns.appendChild(fragment)
}

function updateList(list){
    const fragment = document.createDocumentFragment()
	list.forEach(li => {
		const d = document.createElement('div')
		d.textContent = li.title
		d.classList.add('card')
		fragment.appendChild(d)
	})
	container.innerHTML = ''
	container.appendChild(fragment)
}
```

---
**然后是数据和逻辑层，我们理清楚整个数据的流转过程**

- 刚进入页面时，计算本页应该放多少个 `item`，请求第一页的，拿到 response 并更新视图
	- 基于总页数构建 `btns` 的按钮 `DOM`
	- 基于列表条目构建 `container` 中的列表 `DOM`
- 点击按钮时，请求对应 `page` 的数据并更新视图，此次不再需要更新 btns，当然，如果存在数据条目可变的情况，就需要重新更新页码了。

```js
// 数据请求函数
function fetchData(page, limit) {
	const url = new URL('http://localhost:3000/api/list')
	url.searchParams.set('page', page)
	url.searchParams.set('limit', limit)
	return fetch(url, {
		headers: {
			'Content-Type': 'application/json',
		},
	}).then(res => {
		return res.json()
	})
}
```

```js
// 页面初始化时
const itemsPerPage = 20 // 该页固定展示 20 个items
fetchData(1, itemsPerPage).then(res => {
	updateBtns(res.totalPages)
	updateList(res.data)
}).catch(e => {
	// error view ..
	console.warn(e)
})
```

```js
// 点击按钮时
// 首先，我们为按钮绑定事件，这里采用事件委托实现,委托父元素来处理事件，减少浏览器事件监听开销。
const btns = document.querySelector('.btns')
btns.addEventListener('click', e => {
	if (e.target.tagName === 'BUTTON') {
		const targetPage = e.target.getAttribute('data-page')
		fetchData(targetPage, itemsPerPage).then(res => {
			updateList(res.data)
			// 如果页码发生变化了
			if(curPagesNum != res.totalPage){
				updateBtns(res.totolPages)
			}
		}).catch(e => {
			console.warn(e)
		})
	}
})
```

如上即可实现一个经典的分页模式。

## 懒加载

当滚动到接近底部时自动加载下一页数据并追加到列表。这种实现模式也有其他名字，比如无限滚动，触底加载这样子。这很像 map 里的瓦片化加载方案，也是一种按需加载和卸载的策略，只不过总体的坐标基底不一致哈哈。

### 总体流程

这里没有页的概念了，也没有页码按钮了，不过一屏元素数就是一个 batch ，针对一个 batch ，我们可以复用上面的后端分页接口来实现，后面把一个 batch 还是叫页

1. 页面初始化
	- 加载第一页数据并渲染
2. 用户滚动
	- 监听滚动事件，触底时请求新页数据
	- 将新页数据追加到当前父容器

### 实现

后端我们复用分页接口，这里主要就着重于前端

#### 滚动监听与触底判断

这里需要复习三个`HTMLElement`的 API：
- `el.scrollHeight`: 返回全部内容高度(包括溢出的部分)
- `el.scrollTop`: 返回当前容器顶部距离内容顶部的距离(垂直滚动的像素数)
- `el.clientHeight`: 这个不用多说，包括内容和`padding`
![](../../assets/Pasted%20image%2020250809182828.png)

三个高度的关系：
![](../../assets/Pasted%20image%2020250809183507.png)
可以看到，所谓的触底就是：
`clientHeight + scrollTop + threshold > scrollHeight`

```js
container.addEventListener('scroll', throttle(e => {
	console.log('trigger')
	const threshold = container.clientHeight * 0.3
	if (container.clientHeight + container.scrollTop + threshold > container.scrollHeight) {
		console.log('触底啦')
		loadNewList(++curPage, itemsPerPage)
	}
}))
```

然后我们要做的就是在触底的时候，请求数据并渲染即可。

#### 防抖 or 节流 ？

我一开始用的是防抖，毕竟防抖真就只有最后"不抖"了的时候才会执行，对于`scroll`这种触发及其频繁的事件真是属于降维打击。

但是，这样做用户体验真的好嘛，真的是**无限滚动**吗 ？用防抖实现的话，明显得等一下才能加载后序。节流其实更适合这个无限滚动预加载的场景。

```js
// 老生常谈的 throttle
function throttle(fn, gap = 200){
	let timer = null
	return function(...args){
		if(timer) return
		timer = setTimeout(()=>{
			fn.call(this,...args)
			timer = null
		}, gap) 
	}
}
```
#### 请求锁

当响应很慢时，（可以在 node 中 `setTimeout` 返回来模拟），用户在页面上一直向下滚的时候， 再加之我们采用节流策略，回调函数在指定的 `gap` 间隔触发。

这样会导致什么情况呢？   
在页面上只有 1-20 的时候，前端请求 page2， 再请求 page3，等他们响应之后，瞬间就变成了 1- 60 个条目。

针对以上问题，我们给回调函数加个 pending 状态锁变量即可。
```js
let pending = false
function loadNewList(page, len) {
	if (pending) return // 防止重复请求，不然会一次加载好几页
	console.log('request new page:', page)
	pending = true
	fetchData(page, len).then(res => {
		console.log(res)
		appendList(res.data)
		pending = false
	}).catch(e => {
		console.warn(e)
	})
}
```


#### IntersectObserver 优化

用 **IntersectionObserver** 做无限滚动其实比监听 `scroll` 简单得多。因为它完全不用管 `scrollTop`、`scrollHeight` 这些计算，可以直接判断元素是否出现在当前视口，可以利用这个特性来改进**触底判断**。

如下图，根据 `isIntersecting` 可以看元素是否出现在当前视口
![](../../assets/Pasted%20image%2020250809190215.png)
通常我们会保持容器底部有一个哨兵元素，然后直接监听“底部哨兵元素”是否出现在视口即可。

DOM 中多了一个哨兵元素
```html
<div class="container">
	<div id="sentinel"></div>
</div>
```

插入文档片段的时候，需要注意是 `insertBefore`

```js
function appendList(list) {
	const fragment = document.createDocumentFragment()
	list.forEach(li => {
		const d = document.createElement('div')
		d.textContent = li.title
		d.classList.add('card')
		fragment.appendChild(d)
	})
	// container.appendChild(fragment)
	container.insertBefore(fragment, sentinel)
}
```

利用 InsectObserver 监听哨兵元素
```js
const observer = new IntersectionObserver(entries => {
	if (entries[0].isIntersecting) {
		console.log('触底啦')
		loadNewList(++curPage, itemsPerPage)
	}
}, {
	root: container,
})

observer.observe(sentinel)
```

用 **`IntersectionObserver`** 这种写法，一般不需要节流。
原因是：
- `scroll` 事件会在滚动过程中**持续不断**触发，所以必须手动节流/防抖，否则会高频执行。
- `IntersectionObserver` 是浏览器**底层优化过的可见性监听器**，它不是每一帧都调用回调，而是在浏览器布局/绘制完成、可见性变化时才触发，并且已经做了批量处理和节流。
- 所以在大多数场景下，直接用它就够流畅、性能好，不需要额外 throttle。



## 虚拟列表

虚拟列表，只渲染可视域的元素，核心思路如下图：
- 占位的 placeHolder，提供一个滚轮。
- 固定的 DOM ，变化的内容。
- 监听滚动，计算可视区域所需的数据，更新 DOM。
- 把整个列表容器不断移动，和视口同步。
![](../../assets/Pasted%20image%2020250810182841.png)

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>虚拟列表DEMO</title>
    <style>
        body {
            padding: 0;
            margin: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            background-color: rgb(57, 57, 57);
        }

        .container {
            position: relative;
            width: 500px;
            height: 700px;
            background-color: whitesmoke;
            overflow-y: auto;
            /* padding: 25px; */
        }

        #list {
            margin-left: 50px;
        }


        .item {
            width: 370px;
            height: 50px;
            box-shadow: inset gainsboro 1px 1px 4px 0px;
	        background-color: rgb(244, 252, 255);
            text-align: center;
            line-height: 50px;
        }

        #spacer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background-color: rgb(255, 227, 227);
            z-index: -1;
        }
    </style>
</head>

<body>
    <div class="container">
        <div id="spacer"></div>
        <div id="list"></div>
    </div>

    <script>

        /////// Data //////////////////////////////////
        function fetchData() {
            return new Array(1000).fill(0).map((item, i) => {
                return {
                    id: i,
                    title: `这是第${i}条数据`
                }
            })
        }
        const data = fetchData()
        const itemTotalCount = data.length

        /////// Initial //////////////////////////////////
        const container = document.querySelector('.container')
        const spacer = document.querySelector('#spacer')
        const listDom = document.querySelector('#list')
        const itemHeight = 50 // 设定的

        // 设置 spacer
        spacer.style.height = `${itemTotalCount * itemHeight}px`

        // visibleCount 与 renderCount
        const visibleCount = Math.ceil(container.clientHeight / itemHeight)
        const buffer = 1
        const renderCount = visibleCount + buffer

        // 初始化固定数目的节点
        const fm = document.createDocumentFragment()
        for (let i = 0; i < renderCount; i++) {
            const itemDom = document.createElement('div')
            itemDom.classList.add('item')
            fm.appendChild(itemDom)
        }
        listDom.appendChild(fm)
        const domList = listDom.children

        // 在滚动时执行的渲染函数
        function render() {

            // 1. 计算 startID 和 endID
            const scrollTop = container.scrollTop
            const maxStartID = itemTotalCount - renderCount
            const startID = Math.min(Math.floor(scrollTop / itemHeight), maxStartID)
            const endID = Math.min(itemTotalCount, startID + renderCount)
            console.log(startID, endID)
            // 2. 更新 DOM
            const visible = data.slice(startID, endID)
            visible.forEach((item, i) => {
                domList[i].textContent = item.title
                domList[i].style.display = 'block'
            })
            for (let i = visible.length; i < domList.length; i++) {
                domList[i].style.display = 'none'
            }
            // 3. 移动 ListDom
            const offsetY = scrollTop - scrollTop % itemHeight
            listDom.style.transform = `translateY(${offsetY}px)`
        }

        // 绑定滚动函数
        let pending = false
        container.addEventListener('scroll', _ => {
            if (!pending) {
                requestAnimationFrame(() => {
                    render()
                    pending = false
                })
                pending = true
            }
        })
        // 初始时 render 一次
        render()

    </script>
</body>

</html>
```

最终效果如下：

![](../../assets/屏幕录制%202025-10-07%20151531.mp4)


---

在上面的实现中，我们默认每个条目都是50px，在css和js中都写死为 50了，但是真实应用中，列表中的每一项并非大小完全一致，就比如，表格中有一行文字太多换行了，那么上面的办法就不行了。

说到这，针对不定长的虚拟列表问题，我们也是有方案的。

**核心思想：**
- 因为每一项高度不一致，需要维护一个高度数组获取每一项的高度。
	- 设置列表项的 height 为 fit-content，自然就是由内容撑起高度
	- 如何获取高度呢，用 resizeObserver 去观察几个列表项目DOM，当高度变化时，我们就填入高度数组。
	
- startID 和 endID 的计算？
	- startID应该是视窗内的第一个元素，我们就从 0 累加 itemHeights 数组，到sumHeight 大于 scrollTop 的前一个索引就是我们要的 startID
	- endID 就随意了，尽可能多就行，startID + renderCount 就OK

- 小麻烦，如何把数组中的索引对应到 itemDom 上？
	- 这里我采用的方案是在 DOM 的 dataset 里加一个 idx 属性，在滚动时动态填入，在观察回调时拿到的就是最新的。

- 优化：
	- 采用前缀和数组，`prefixSum[i]` 表示数组 itemHeights 前 i 项的和，这样省的每次都累加计算
	- 有了前缀和数组，找 startID，就可以基于 scrollTOP，在前缀和数组里二分查找，进一步优化。


下面给出我的完整实现：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>不定长虚拟列表DEMO</title>
    <style>
        body {
            padding: 0;
            margin: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: rgb(57, 57, 57);
            font-family: Arial, sans-serif;
        }

        .container {
            position: relative;
            width: 500px;
            height: 700px;
            background-color: whitesmoke;
            overflow-y: auto;
        }

        #list {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            margin-left: 50px;
        }

        .item {
            width: 370px;
            background-color: #fff7ef;
            margin-bottom: 4px;
            box-shadow: inset 0 0 4px rgb(247, 120, 1);
            line-height: 1.5;
            text-align: center;
        }

        #spacer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            background-color: rgb(255, 227, 227);
            z-index: -1;
        }
    </style>
</head>

<body>
    <div class="container">
        <div id="spacer"></div>
        <div id="list"></div>
    </div>

    <script>
        ///////////// Data /////////////
        function fetchData() {
            return new Array(1000).fill(0).map((_, i) => {
                const rand = Math.round(Math.random() * 9)
                return {
                    id: i,
                    title: `这是第 ${i} 条数据 `.repeat(rand + 1)
                }
            })
        }

        const data = fetchData()
        const itemCount = data.length

        const container = document.querySelector('.container')
        const spacer = document.querySelector('#spacer')
        const listDom = document.querySelector('#list')

        /////// Initial //////////////////////////////////
        const estimatedHeight = 50 // 预估高度
        const itemHeights = new Array(itemCount).fill(estimatedHeight)
        let prefixHeights = [] // 前缀和数组

        function updatePrefixHeights() {
            prefixHeights = new Array(itemCount)
            let sum = 0
            for (let i = 0; i < itemCount; i++) {
                sum += itemHeights[i]
                prefixHeights[i] = sum
            }
            spacer.style.height = sum + 'px'
        }
        updatePrefixHeights()

        ///////////// 初始化相关DOM /////////////
        const visibleCount = Math.ceil(container.clientHeight / estimatedHeight)
        const overscan = 3 // buffer
        const renderCount = visibleCount + overscan * 2 // 上下 buffer

        const frag = document.createDocumentFragment()
        for (let i = 0; i < renderCount; i++) {
            const div = document.createElement('div')
            div.classList.add('item')
            frag.appendChild(div)
        }
        listDom.appendChild(frag)
        const domList = Array.from(listDom.children)

        ///////////// 监听每个元素高度变化 /////////////
        const resizeObs = new ResizeObserver(entries => {
            for (const entry of entries) {
                // 用 dataset-idx 来拿到索引
                const idx = Number(entry.target.dataset.idx)
                const newHeight = entry.contentRect.height
                if (itemHeights[idx] !== newHeight) {
                    itemHeights[idx] = newHeight
                    updatePrefixHeights()
                }
            }
        })
        domList.forEach(el => resizeObs.observe(el))

        ///////////// 基于 scrollTop 查找 startID /////////////
        function findStartIndex(scrollTop) {
            // 因为有了前缀和数组，所以直接二分查找
            let low = 0, high = prefixHeights.length - 1, mid
            while (low <= high) {
                mid = (low + high) >> 1
                if (prefixHeights[mid] < scrollTop) low = mid + 1
                else high = mid - 1
            }
            return low
        }

        ///////////// 渲染函数 /////////////
        function render() {
            // 计算 startID，endID
            const scrollTop = container.scrollTop
            const startID = Math.max(0, findStartIndex(scrollTop) - overscan)
            let endID = Math.min(itemCount, startID + renderCount)

            // 新数据更新DOM
            const visibleItems = data.slice(startID, endID)
            visibleItems.forEach((item, i) => {
                const el = domList[i]
                el.textContent = item.title
                el.style.display = 'block'
                el.dataset.idx = startID + i // 用dataset.idx记录索引
            })

            // DOM的偏移量应该是*之前*的所有items的和
            const offsetY = startID > 0 ? prefixHeights[startID - 1] : 0
            listDom.style.transform = `translateY(${offsetY}px)`
        }

        ///////////// 滚动绑定 + 初始渲染 /////////////
        let pending = false
        container.addEventListener('scroll', () => {
            if (!pending) {
                requestAnimationFrame(() => {
                    render()
                    pending = false
                })
                pending = true
            }
        })

        render()
    </script>
</body>

</html>
```

效果如下：

![](../../assets/屏幕录制%202025-10-07%20162734.mp4)