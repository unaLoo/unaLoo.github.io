---
title: '跨域及其解决方案'
date: 2025-06-13
tags:
  - 计算机网络

---

> 之前一直以为CORS就是跨域，其实CORS是跨域的一种**解决方案**，聊一聊跨域，(●ˇ∀ˇ●)

## 浏览器的同源策略

浏览器有一个重要安全策略，叫做**同源策略**（Same-Origin Policy）
    
其中`源 = 协议 + 域名 + 端口`，如果两个URL的源相同，则它们是同源的，否则就是跨源/跨域。
     
具体表现为：当页面的源和运行时加载资源的源不一致时，浏览器会限制跨域资源访问。

对于AJAX请求，默认情况下，浏览器不允许AJAX跨域请求。

![同源策略](/post-assets/跨域.png)

## 跨域解决方案

### 代理

通常在开发阶段，前端会通过代理服务器解决跨域问题

比如使用`dev-server`，它会在本地启动一个代理服务器，将请求转发到目标服务器，从而解决跨域问题。

### CORS

跨域资源共享（Cross-Origin Resource Sharing, CORS）是一种跨域解决方案

核心理念：如果服务器允许跨域访问，那浏览器就放行这个访问，因此，CORS主要通过在服务端正确设置响应头来实现
    
CORS规定了三种不同的交互模式，三种模式自上而下要求越来越严格：

1. **简单请求**
  - 要求：
    - 请求方法属于：GET | POST | HEAD
    - 请求头仅包含安全字段：Accept | Accept-Language | Content-Type... 不包含自定义请求头
    - 请求头Content-Type仅包含：application/x-www-form-urlencoded | multipart/form-data | text/plain 注意没有`application/json`
  - 交互规范：
    - JS发起请求
    - 浏览器在请求头自动添加`Origin`字段，表示请求的源
    - 如果服务器允许该请求跨域访问，需要在服务器响应头中包含`Access-Control-Allow-Origin`字段，表示允许的源，其值可以是`*`或具体源
    - 浏览器收到响应后，JS正常执行后续代码逻辑

2. **需预检的请求**
  - 要求：非简单请求
  - 交互流程：

    - JS发起请求

    - 浏览器发送预检请求`OPTIONS`，询问服务器是否允许该请求，OPTIONS请求头包含以下：
      - `Origin`：请求的源
      - `Access-Control-Request-Method`：真实请求的方法
      - `Access-Control-Request-Headers`：真实请求的头

    - 如果服务器不允许，浏览器会抛出CORS错误

    - 服务器允许的话，返回响应头包含以下：
      - `Access-Control-Allow-Origin`字段，表示允许的源, __不能是`*`__!
      - `Access-Control-Allow-Methods`字段，表示允许的请求方法
      - `Access-Control-Allow-Headers`字段，表示允许的请求头
      - `Access-Control-Allow-Max-Age`字段，表示允许的请求最大时间, 时间内不需要再次发送预检请求、
    
    
    - 浏览器发送真实请求，请求头还是带着`Origin`字段
    - 服务器正常处理请求，返回响应头包含`Access-Control-Allow-Origin`字段，表示允许的源
    - 浏览器收到响应后，JS正常执行后续代码逻辑，

    
3. **附带Credentials的请求**
  - 要求：非简单请求，且需要携带Credentials

  - 交互流程：
    - JS必须设置 credentials: 'include'，发起请求
      ```js
        fetch('http://localhost:3000/api/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ```
    - 浏览器发送预检请求`OPTIONS`，还是那几个

    - 服务器允许的话，返回响应头包含以下，还是那几个，加上`Access-Control-Allow-Credentials: true`
    
    - 浏览器发送真实请求，请求头还是带着`Origin`字段，并携带Cookie
    
    - 浏览器收到响应后，JS正常执行后续代码逻辑

小的补充，在CORS，服务器需要设置`Access-Control-Expose-Headers`字段，表示允许的响应头，否则JS只能获取最基本的响应头


### JSONP

JSONP（JSON with Padding）是一种古老的跨域解决方案。了解就行
    
**核心理念**：利用script标签的src属性不受同源策略限制，可以请求不同源的资源

**实现流程**：
  1. 前端定义一个全局回调函数：function callback(data) { ... }
  2. 创建一个 `<script>` 标签，src 设置为 `http://目标域名/api?callback=callback`
  3. 浏览器向目标服务器发起请求
  4. 服务器接收到请求后，**返回一段 JS 脚本**：`callback({ "name": "Alice" })`
  5. 浏览器执行这段脚本，相当于调用了 callback 函数，拿到数据并执行后续逻辑

## 思考：
1. 什么是跨域？
2. 解决跨域问题有哪些手段？
3. CORS的简单请求和需预检的请求如何区分？
4. 说说CORS简单请求和需预检的请求在浏览器服务器交互流程？
