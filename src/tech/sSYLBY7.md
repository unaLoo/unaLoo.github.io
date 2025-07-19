---
title: 'SPA单页面应用的实现(hash和history)'
date: 2025-06-27
tags:
  - 前端框架

---

## 1. 认识 SPA

**SPA**
Single Page Application，单页面应用，它通过动态重写当前页面，动态装载所需资源，实现快速加载和响应。
    
**MPA**
多页面应用，每个页面都是一个独立的文件，页面之间切换需要重新加载整个页面。

|    | SPA | MPA |
| --- | --- | --- |
| 资源组成 | 一个HTML+一堆JS/CSS | 多个HTML+JS+CSS |
| URL 模式 | 基于hash / history | 原生基于history |
| SEO | **不利于SEO** | 利于SEO |
| 数据传递 | 数据传递容易 | 数据传递麻烦，借助cookie/localStorage |
| 用户体验 | 页面切换快，**首屏相对慢**,但后续内容更新快 | 页面切换慢，首屏快，但后续内容需重新加载整个页面 |


## 2. SPA 实现原理
    
在浏览器url发生变化时，浏览器会向服务器发送请求。
    
SPA 通过特定方式监听/拦截浏览器url的变化，来实现页面的切换。
    
主要有两种方式 `hash` 和 `history`

### 2. 1 Hash Router

原理：浏览器url的hash值发生变化时，不会向服务器发送请求，不会刷新页面，所以可以监听hash值的变化`hashchange`实现页面切换。

```js
  class HashRouter {
    constructor(){
      this.routes = {}
      this.currentHash = ''
      this.onHashChange = this._onHashChange.bind(this)

      window.addEventListener('load', this.onHashChange)
      window.addEventListener('hashchange', this.onHashChange)
    }

    _onHashChange(){
      this.currentHash = location.hash.slice(1) || '/'

      if(this.routes[this.currentHash]){
        this.routes[this.currentHash]()
      }else{
        console.log('404 not found page')
        this.routes['/']()
      }
    }

    registerRoute(path, callback){
      this.routes[path] = callback
    }

    push(path){
      if (this.currentHash !== path) {
        location.hash = path
      }
    }
  }


  const router = new HashRouter()
  router.registerRoute('/', () => {
    console.log('render home page')
  })

  router.registerRoute('/about', () => {
    console.log('render about page')
  })

  aboutBtn.onclick = () => {
    router.push('/about')
  }

  homeBtn.onclick = () => {
    router.push('/')
  }
```

### 2. 2 History Router

H5新增了 history api，允许操作浏览器的曾经在标签页或者框架里访问的会话历史记录。
`back` 后退，`forward` 前进，`go(n)` 前进后退n步
`pushState` 添加新的历史记录
`replaceState` 替换当前历史记录

```js
  // History API
  window.addEventListener('popstate', (event) => {
    console.log(`位置：${document.location}，状态：${JSON.stringify(event.state)}`);
  })

  history.pushState('home', '1', '/home')
  history.pushState('manage', '1', '/manage')
  history.pushState('about', '1', '/about')
  history.replaceState('home', '1', '/home')

  console.log(history) // History {length: 26, scrollRestoration: 'auto', state: 'home'}
  history.back() // http://127. 0. 0. 1:5500/manage，状态："manage"
  // 此时，浏览器的前进后退按钮都可用，可以按上面的顺序前进后退
```

可以看到，history api可以直接操作浏览器历史记录和当前url，且不会刷新页面，基于此监听`popstate`就可以做路由。

```js
  class HistoryRouter {

    constructor() {
      this.routes = {}
      this.onPopState = this._onPopState.bind(this)

      window.addEventListener('popstate', this.onPopState)
        // 初始化：刷新时手动触发当前路由
      const currentPath = location.pathname || '/'
      this.routes[currentPath]()
    }

    _onPopState(event) {
      const currentPath = event.state ? event.state.path : '/'
      if (this.routes[currentPath]) {
        this.routes[currentPath]()
      } else {
        console.log('404 not found page')
        this.routes['/']()
      }
    }

    registerRoute(path, callback) {
      this.routes[path] = callback
    }

    push(path) {
      history.pushState({ path }, '', path)
    }

  }


```




## 参考资料
(web-interview)[https://github.com/febobo/web-interview]{target="_blank" rel="noreferrer"}
(History API)[https://developer.mozilla.org/zh-CN/docs/Web/API/History]{target="_blank" rel="noreferrer"}