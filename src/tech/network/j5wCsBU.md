---
title: 'WebSocket'
date: 2025-06-22
tags:
  - 计算机网络

---

> WebSocket 是 HTML5 中的一种通信协议，用于在浏览器和服务器之间建立双向通信。



## 背景问题

股票K线图、聊天、警报、抢购时的库存展示，这些信息都需要实时性。   
但HTTP协议是*请求-响应*模式，必须有请求才有响应。

---

### 传统解决方案

1. 短轮询`short polling`
  - 客户端每间隔短时间，就向服务器发送一次请求，询问是否有新消息。
  - 优点：简单
  - 缺点：
    - 需要频繁发送请求，很多请求可能还是无意义的
    - 频繁的建立和断开连接，浪费资源
    - 无法保证实时性

2. 长轮询`long polling`
  - 客户端发送请求后，服务器不会立即响应，而是等待有新消息时才响应。
  - 优点：
    - 请求数少了，节省了资源
  - 缺点：
    - 当客户端长时间没有消息时，会自动断开，需要
    - 服务器一直挂起一个请求，直到有新消息，这时服务器占用资源但啥也没干

## WebSocket

HTML5 定义了 WebSocket 协议，赋予了**服务器主动向客户端发送消息的能力**。

### 基本流程
- 客户端发起请求，使用`ws`或`wss`协议
- TCP三次握手建立连接
- WebSocket 握手
- 握手成功后，开始双工通信，相互发消息...
- 客户端或服务器任一方主动断开连接后，四次挥手断开连接。

### 缺点
- 兼容性问题， H5 之前浏览器不支持
- 维持TCP连接需要消耗资源

### WebSocket 握手 🌟

WebSocket握手实际上是使用**HTTP协议**进行一次特殊的请求-响应，例如：

```http
// 发起握手请求
GET ws://localhost:8080/ws

// headers
Connection: Upgrade // 表示要升级协议
Upgrade: websocket // 表示要升级为WebSocket协议
Sec-WebSocket-Version: 13 // 表示WebSocket协议版本
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw== // 一个随机Key值

```

```http
// 服务器返回响应 101
HTTP/1. 1 101 Switching Protocols // 表示要切换协议
Upgrade: websocket // 表示要升级为WebSocket协议
Connection: Upgrade // 表示要升级协议
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo= // 一个随机Accept值
```





## 思考
1. 实时场景的传统解决方案？
2. 讲讲webSocket协议？ - H5的新协议，持久连接，双工通信
3. 讲讲webSocket握手过程？ - `Connection: Upgrade`  `101 Switching Protocols`
