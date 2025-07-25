---
title: 'HTTP的版本差异'
date: 2025-06-17
tags:
  - 计算机网络

---

> HTTP1. 0 \ HTTP1. 1 \ HTTP2. 0 的差异，简要介绍


## HTTP1. 0

两个点，**无法复用连接**，**队头阻塞**

### 无法复用连接

**概念**
TCP连接不复用：每个请求-响应过程，都需要建立一个TCP连接，请求完成后，连接断开。
    
**具体地**
每次HTTP请求，都要经历：
- 客户端发HTTP请求
- TCP三次握手建立连接
- 发送HTTP请求报文
- 服务端响应HTTP报文
- TCP四次挥手断开连接
   
我们说TCP连接就是双方各自开辟一个Buffer，用于存储传输过来的数据。
频繁的创建和销毁，会造成**内存**资源的浪费，也**耗时间**。
     
同时，由于TCP协议有**拥塞控制**，所以一开始发送速率很慢，传输的数据量很小，一段时间后，发送速率逐渐提高，传输速率达到峰值。
      
但HTTP1. 0这种模式，无法充分利用网络带宽，因为每次请求都要建立一个TCP连接，请求完成后，很快完成小量传输就连接断开，压根达不到网络带宽的峰值。

### 队头阻塞

**概念**
HTTP1. 0中，由于短连接机制，客户端在同一个 TCP 连接上无法并行发送多个请求，处理完一个请求后才能处理下一个请求。这被称为**队头阻塞(Head-of-Line Blocking)**。
    
**具体地**
如果某个请求（例如一个大的图片文件或一个慢速的服务器响应）的处理时间较长，那么后续的所有请求都必须等待它完成，即使这些后续请求的资源可能已经准备就绪，或者它们是更小的、可以快速响应的资源。

## HTTP1. 1

### 长连接

HTTP1. 0需要`Connection: keep-alive`来开启长连接，HTTP1. 1默认开启长连接，让同一个TCP连接处理多个请求-响应。充分利用网络带宽。

**连接断开的时机：**
- 某次请求或某次响应设置了`Connection: close`，收到后会断开连接
- 当连接空闲时间超过`Keep-Alive: timeout=60`设定的时间，服务器会主动断开连接


### 管道化和队头阻塞

#### 什么是管道化？

**管道化(Pipelining)**是HTTP1. 1的一个重要特性，允许客户端在等待上一个请求的响应时，就可以发送下一个请求，而不需要等待响应完成。

#### 管道化的工作原理

**HTTP1. 0 (无管道化)：**
```
客户端: 请求1 → 等待响应1 → 请求2 → 等待响应2 → 请求3
服务器: 响应1 ← 处理请求1 ← 响应2 ← 处理请求2 ← 响应3
```

**HTTP1. 1 (有管道化)：**
```
客户端: 请求1 → 请求2 → 请求3 (连续发送)
服务器: 响应1 ← 响应2 ← 响应3 (按顺序响应)
```

#### 管道化的问题

虽然HTTP1. 1支持长连接，可以在一个请求发出后，继续发送下一个请求，但服务器还是**必须按照请求的顺序来响应请求**。

如果第一个请求处理时间很长，那么后续的所有请求即使处理完了，也得等待第一个请求处理完响应完，才能继续响应。

**示例场景：**
```
请求1: 获取大图片 (需要5秒)
请求2: 获取小图标 (需要0. 1秒)  
请求3: 获取CSS文件 (需要0. 1秒)

结果：请求2和请求3虽然很快处理完，但必须等待请求1的5秒完成后才能响应
```

所以，HTTP/1. 1 的管道化（Pipelining）虽然在协议层面被设计用来提高性能，但它在实际应用中并没有取得预期的成功，队头阻塞（Head-of-Line Blocking, HOLB）问题依然存在。
     
主流的浏览器（如 Chrome, Firefox 等）默认都没有启用 HTTP/1. 1 的管道化功能。 它们宁愿使用限制并行连接数量（通常是 6-8 个）的简单多连接模式，然后通过**域名分片（Domain Sharding）**来绕过这种限制，虽然这也会带来额外的 TCP 握手和 DNS 查询开销。

---

那仍然存在的队头阻塞问题，怎么解决呢？
1. 减少文件数量，即减少请求数
2. 开辟多个TCP长连接，表面上可以并行发送请求，但每个TCP内部还是串行处理，现代浏览器一般开启6个TCP长连接


## HTTP2. 0

必须是HTTPS，因为HTTP2. 0是基于TLS/SSL的。
   
HTTPS解决的主要问题就是队头阻塞问题。

### 二进制分帧

HTTP2. 0允许以更小的单元来传输数据，每个传输单元称为**帧**，每一个请求或响应，都由多个帧组成，称为**流**,每个流有编号，每个帧记录了所属流编号。
     
将所有传输信息分割为更小的消息和帧，并对它们采用二进制格式的编码将其封装，新增的二进制分帧层同时也能够保证HTTP的各种信息都不受影响。其中，HTTP1. X中的首部信息header封装到Headers帧中，而request body将被封装到Data帧中。
    
如此一来，这些帧可以**乱序传输**，**并行传输**，还可以**分优先级**，最后再在另一端把它们重新**组合还原**。
    
### 多路复用（连接共享）

在HTTP1. 1中，浏览器客户端在同一时间，针对同一域名下的请求有一定数量的限制（通常是6个并发连接），超过限制数目的请求会被阻塞。这也是为何一些站点会有多个静态资源 CDN 域名的原因之一。

---      

HTTP 2. 0 连接都是**持久化**的，而且客户端与服务器之间也只需要一个连接（每个域名一个连接）即可。HTTP2连接可以承载数十或数百个流的**复用**。
    
多路复用意味着来自很多流的数据包能够混合在一起通过**同样连接**传输。当到达终点时，再根据不同帧首部的流标识符重新连接将不同的数据流进行组装。

### 头部压缩

打开浏览器的网络面板，可以看到很多请求头都是重复的，比如`Host`，`Accept-Encoding`，`Accept-Language`，`User-Agent`等等。

HTTP2. 0的头部压缩，就是**HPACK**算法，它通过使用静态表和动态表来减少头部信息的重复，从而减少传输的数据量。

### 服务端推送

HTTP2. 0的**服务端推送**，就是服务器可以主动推送资源给客户端，比如在客户端请求一个HTML页面时，服务器可以主动推送一个CSS文件和JavaScript文件给客户端。

### 小结
多路复用和之前HTTP1/1. 1的队头阻塞问题一直让我觉得有点矛盾，再怎么说，同一个时刻，一个TCP连接只能在传输一个数据吧。    
私以为：本质上TCP还是阻塞的，只是在应用层，通过分帧而且每个帧上有流id，可以在数据发送端快速分帧 ，在数据接收端快速组合成流，从而实现了看似并发请求的效果。


#### 与SSE的区别

**SSE (Server-Sent Events)：**
- 基于HTTP1. 1的长连接
- 服务器向客户端推送**事件流数据**
- 主要用于实时数据推送（如股票价格、聊天消息）
- 客户端使用 `EventSource` API 接收

**HTTP2服务端推送：**
- 基于HTTP2的流机制
- 服务器主动推送**静态资源**（CSS、JS、图片等）
- 主要用于优化页面加载性能
- 客户端自动接收，无需特殊API

**对比示例：**

**SSE (实时数据推送)：**
```javascript
  // 客户端
  const eventSource = new EventSource('/api/events');
  eventSource.onmessage = function(event) {
      console.log('收到数据:', event.data);
  };

  // 服务器推送
  // 2024-01-01 10:00:00
  // data: {"price": 100. 50}
  //
  // 2024-01-01 10:00:01  
  // data: {"price": 100. 75}
```

**HTTP2服务端推送 (资源推送)：**
```txt
  # 客户端请求
  GET /index.html HTTP/2

  # 服务器响应 + 推送
  HTTP/2 200 OK
  Content-Type: text/html

  # 同时推送相关资源
  PUSH_PROMISE /style.css
  PUSH_PROMISE /script.js
```

- **用途不同**：SSE用于数据推送，HTTP2推送用于资源优化
- **协议不同**：SSE基于HTTP1. 1，HTTP2推送基于HTTP2
- **内容不同**：SSE推送事件流，HTTP2推送静态资源
- **API不同**：SSE需要EventSource，HTTP2推送自动处理

## HTTP3. 0 (QUIC)

HTTP3. 0 基于QUIC (Quick UDP Internet Connections) 协议，传输层使用UDP

### 核心特性

**基于 UDP 的 QUIC 协议：**
这是 HTTP/3 最根本的变化。QUIC 协议集成了 TCP 的可靠性、流控制、拥塞控制等特性，同时彻底解决 TCP 队头阻塞： 在传输层实现了**多路复用**，即使某个流发生丢包，其他流也不会受影响。

**更快的连接建立、连接迁移、内置TLS1. 3加密**

### 解决了什么问题？
* 彻底解决了 TCP 层的队头阻塞。
* 进一步降低了连接建立延迟。
* 在弱网络和移动网络环境下表现更好。

### 缺点：
* UDP 穿透防火墙问题： 许多企业防火墙可能会限制 UDP 流量。
* 服务器和浏览器支持尚不完善： **仍在普及中**。


## 思考
1. **HTTP1. 0,1. 1,2. 0 的差异，简要介绍**
  - HTTP1. 0 无法复用连接，队头阻塞
  - HTTP1. 1 长连接，管道化但队头阻塞，还新增了缓存相关的如`Cache-Control`以及分段下载的`Range`
  - HTTP2. 0 二进制分帧，多路复用，头部压缩，服务端推送

2. **为什么HTTP1. 1 不能解决队头阻塞？不能多路复用？**
  - HTTP1. 1 传输的单位是整个HTTP报文数据，必须完整地接受、处理、响应，才能进行下一个请求，否则会混乱, 所以会堵塞。
  - 而HTTP2. 0 传输的单位是帧，帧中存储了流的编号信息可以还原为流，所以可以多路复用，乱序传输，按优先级传输。

3. **HTTP1. 1 是如何复用TCP连接的？**
  - 默认启用长连接，有时为了兼容会设置`Connection: keep-alive`
  - 服务器在收到请求后就和客户端建立可复用的TCP长连接
  - 减少了TCP连接建立和断开的开销
  - 但HTTP1. 1 的管道化，并没有解决队头阻塞问题，因为服务器还是必须按照请求的顺序来响应请求。
  - 浏览器一般开启6个TCP长连接，所以可以并行发送请求，但每个TCP内部还是串行处理，所以还是会有队头阻塞问题。

4. **什么是"多路复用"？为什么叫这个名字？**
   
   **"多路"指的是多个数据流**
   - 每个HTTP请求/响应对应一个"流(Stream)"
   - 多个请求同时进行 = 多个流同时传输
   - 比如：CSS请求、JS请求、图片请求 = 3个流

   **"复用"指的是复用同一个TCP连接**
   - HTTP1. 1：每个请求需要一个TCP连接（6个并发连接）
   - HTTP2：所有请求复用同一个TCP连接
   - 从"多连接"变为"单连接多流"

   **具体对比：**
   ```
   HTTP1. 1 (多连接模式)：
   TCP连接1: 请求1 → 响应1
   TCP连接2: 请求2 → 响应2  
   TCP连接3: 请求3 → 响应3
   ...
   TCP连接6: 请求6 → 响应6
   
   HTTP2 (多路复用模式)：
   TCP连接1: {
     流1: 请求1 → 响应1
     流2: 请求2 → 响应2
     流3: 请求3 → 响应3
     ...
     流100: 请求100 → 响应100
   }
   ```

   **"多路复用"的含义：**
   - **多路**：多个数据流（多个请求/响应）
   - **复用**：复用同一个传输通道（TCP连接）
   - **效果**：在单个连接上同时传输多个数据流

5. HTTP2的帧、流、连接的关系是什么？
   
   **层次关系：**
   ```
   连接(Connection) 
   ├── 流1(Stream) 
   │   ├── 帧1(Frame) - 头部信息
   │   ├── 帧2(Frame) - 数据块1
   │   └── 帧3(Frame) - 数据块2
   ├── 流2(Stream)
   │   ├── 帧1(Frame) - 头部信息
   │   └── 帧2(Frame) - 数据块1
   └── 流3(Stream)
       ├── 帧1(Frame) - 头部信息
       └── 帧2(Frame) - 数据块1
   ```

   **传输过程：**
   ```
   实际传输顺序：
   [流1帧1] [流2帧1] [流3帧1] [流1帧2] [流2帧2] [流3帧2] ...
   
   接收方重组：
   根据帧头中的流ID，将帧重新组装成对应的流
   ```




