---
title: SSR
date: 2025-10-05
tags:
  - SSR
---
# SSR 服务端渲染

早期，前端页面是由后端 JSP、SpringMVC 等框架生成HTML的，这是最原始的SSR，后来出现了 React Vue 这样的 SPA 框架，但是 SPA 有一些缺点，比如 SEO、性能，出现了一些现代 SSR 框架....

`SSR`：再服务端将网页内容渲染为完整 HTML，然后发送到浏览器
`CSR`：在浏览器端通过 JS 动态去挂载 DOM、生成完整页面

**🔦 SSR 的优势：** 
- 首屏速度
- SEO 优化
- 共享链接预览（也是基于完整HTML的）

**📛 SSR 的劣势：**  
- 开发复杂度
- 服务器压力
- 状态管理（服务端和客户端的状态同步和数据一致性问题）

### SSR框架
- vue
	- nuxt.js
- react
	- next.js
	- remix
#### 约定式路由

核心应该就是编译时，基于文件夹结构构造路由。
支持动态路由，如 `[id].tsx`
![](../../assets/Pasted%20image%2020251005130555.png)
#### 数据获取
- getServerideProps
![](../../assets/Pasted%20image%2020251005130504.png)


## 与早年的服务端生成 HTML 相比

现代的 vue、react 等 SPA 生态为前端带来了一套工程化体系，不只是这些视图框架，还包括 webpack、vite 等打包工具、postCSS等工具，已经形成了一套全面的工具链。

早年的服务端生成 HTML，以 node 生态中的 ejs 为例，就是一个老牌模板解析引擎。但他仅仅是做了一个模板规范和模板解析，我们在写代码的时候就是得用他的一套模板规范来写，来做。写出来的、解析出来的也就是纯粹的 html，压根没有用到上边的工具生态。
![](../../assets/Pasted%20image%2020251005113727.png)

老牌服务端渲染的简单示例。

```js
import http from 'node:http'
import fs from 'node:fs'

const server = http.createServer((req, res) => {
    res.writeHead(200, {"content-type": "text/html"})
    // 带模板的html，比如 ejs,jade 等老牌模板引擎
    const html = fs.readFileSync("index.html", "utf-8")
    // 模拟模板编译
    const compilerHtml = html.replace('{name}', '小王')
    res.end(compilerHtml) 
})

server.listen(3000, ()=>{
    console.log("server is running")
})
```

总的来说，现代 SSR 框架做的，是把**服务端渲染**和**现代前端工程化体系**结合。

## 关键问题

有的场景应用是服务端渲染做不到的，依赖于前端渲染
- canvas
- 事件绑定
- 层叠样式表解析

此外，还存在以下问题：
- 如何降低服务端成本 ？ 前端混合式渲染？
- 现有 SPA 应用如何重构为 SSR 架构？

所以出现了一些前后端同构、预渲染、混合式渲染的模式。

## SSR 的基本原理和实现

基于 express、react、vite 实现 SSR demo

```jsx
// renderer.jsx : renderToString 服务端组件渲染 
//////////////
import React from 'react'; // 👈 必须显式导入，否则无法处理 JSX
import { renderToString } from 'react-dom/server'
import Hello from './hello'

export function render() {
    // 硬编码了 hello 组件
    const html = renderToString(<Hello />)
    return html
}
```

```js
// server.js : 返回 html
///////////////////////
import express from 'express'
import { createServer } from 'vite'

// 通过 vite 帮忙完成项目构建，创建 vite 中间件服务
const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
})

const app = express()
app.use(vite.middlewares)

app.get("/hello", (req, res) => {
    res.send("OK");
});

app.use(async (req, res) => {
// 通过 vite 加载模块，vite 可以完成依赖处理、路径映射和转换插件编译转换等
    const { render } = await vite.ssrLoadModule("renderer.jsx")
    const html = render()
    res.status(200).send(html);
});

app.listen(3000, () => {
    console.log("running 3000")
})
```

上面的页面ok了，但感觉不痛不痒，和之前说的 ejs 又有啥区别呢？哦用到了 vite 是吧，用到了 react 是吧....

在稍加更改就发现，静态页面还OK，一点毛病没有，DOM 交互就不行了，比如下边的计数器交互。

```ts
// hello.jsx
import React from 'react'; 
import { useState } from 'react';
export default function Hello() {
    const [count, setCount] = useState(0)
    const handleAdd = () => {
        setCount(c => c + 1)
    }
    return <>
        <div>{count}</div>
        <button onClick={handleAdd}> + </button>
        <button onClick={() => setCount(c => c - 1)}> - </button>
    </>
}
```

这时候就需要做 hydrate 了

> React api:`hydrateRoot(container, initialChild)`
> 
> Same as `createRoot()`, but is used to **hydrate** a container whose HTML contents were rendered by ReactDOMServer.
> 
> React will attempt to attach event listeners to the existing markup.

可以看到，通过调用 hydrateRoot api，react 会在已经由 ReactDomServer 渲染的 HTML上附着事件监听器。

所以，对于上面的计数器，我们要做两件事情，一是从组件渲染得到基本HTML，二是利用React帮我们完成事件监听的激活。


### Step 1 项目结构

我采取了如下的结构，public 下是基础的 index.html，src 下是核心代码，client 放客户端激活代码，ssr 放服务端渲染代码，components 放公共组件。
![](../../assets/Pasted%20image%2020251005151525.png)
### Step 2 组件开发

首先是基础的组件，还是以计数器组件为例，在 components 下创建 Hello.jsx
```jsx
// src/components/Hello.jsx
import React, { useState } from 'react';
export default function Hello() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={() => setCount(c => c - 1)}>-1</button>
    </>
  );
}
```

### Step 3 服务端渲染部分

服务端渲染这部分，我们需要把组件内容生成 html，很简单。

```jsx
// /src/ssr/renderer.jsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import Hello from '../components/Hello.jsx';

export function render() {
  // ✅ 生成静态 HTML 字符串
  return renderToString(<Hello />);
}
```

### Step 4 客户端hydrate部分

该部分的代码会在DOM挂载后执行，通过 hydrateRoot API  实现事件绑定激活。

```jsx
// /src/client/main.jsx
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Hello from '../components/Hello.jsx';

// ✅ 激活服务端渲染的 HTML
hydrateRoot(document.getElementById('app'), <Hello/>);
```

既然是在DOM挂载后执行，那么我们顺序写一下 index.html
此处有几个注意点：
- `div#app` 是需要的，作为水合的根元素，作为服务端渲染结果的根元素
- `<!--ssr-outlet-->`是一个自定义标记，便于字符串替换，把渲染好的 html 替换到这部分
- 记得引入 client 相关代码，激活事件

```html
// /public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>SSR Demo</title>
</head>
<body>
  <!-- SSR 内容将注入到这里 -->
  <div id="app"><!--ssr-outlet--></div>

  <!-- 客户端入口 -->
  <script type="module" src="/src/client/main.jsx"></script>
</body>
</html>
```

### Step 5 HTTP 服务器部分

主要通过 express、react、vite 实现

- Vite 作为中间件，提供了模块加载和转换能力，`vite.ssrLoadModule()` 可以读取 jsx，做模块化兼容。个人感觉最重要的就是模块加载能力，vite middlewares可以从项目根目录去找文件，省去了配置静态资源目录的时间。

- express 比起原始的`node:http`，提供了更简洁实用的 API，比如 `app.use()`

```js
// /src/ssr/server.js
import express from 'express';
import fs from 'node:fs';
import { createServer } from 'vite';

const app = express();

// 创建 Vite 开发服务器（中间件模式）
const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    root: process.cwd(),
});

app.use(vite.middlewares);

app.use('/home', async (req, res) => {
    try {
        // 1. 读取并转换 index.html（注入 Vite 开发资源）
        const template = fs.readFileSync('./public/index.html', 'utf-8');
        // 如果返回 template，那就是纯粹的客户端渲染，可以禁用js看看还能不能加载出来
        const html = await vite.transformIndexHtml(req.originalUrl, template);

        // 2. 加载 SSR 渲染函数（Vite 自动处理 JSX/ESM）
        const { render } = await vite.ssrLoadModule('/src/ssr/renderer.jsx');

        // 3. 获取组件的静态 HTML
        const ssrHtml = render();

        // 4. 注入到 #app 内部
        const finalHtml = html.replace('<!--ssr-outlet-->', ssrHtml);

        res.status(200).send(finalHtml);
    } catch (error) {
        console.error('SSR Error:', error.stack);
        vite.ssrFixStacktrace(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('SSR server running on http://localhost:3000');
});
```

上面我在注释中提到，如果直接返回 template，那 hydrateRoot 也会做渲染，不影响正常功能，完全变成了客户端渲染。
![](../../assets/Pasted%20image%2020251005153509.png)

上面我在注释中提到，如果正常服务端渲染水合，最终的网页源代码长这样。可以看到我们Hello 组件的内容直接就在 html 里呈现了。
![](../../assets/Pasted%20image%2020251005153606.png)

