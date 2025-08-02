---
title: '浏览器输入URL到页面渲染'
date: 2025-06-17
tags:
  - 计算机网络

---

> 谈谈浏览器输入URL到页面渲染的流程？## 浏览器输入URL到页面渲染

1. 自动补全协议、端口
2. URL-Encoding 编码为 ASCII 码
3. 浏览器基于URL查找本地缓存，如果cache hit，则直接返回缓存内容，不再发送请求
4. 通过DNS解析域名，获取IP地址
5. 浏览器和目标服务器建立TCP连接，完成三次握手后，建立连接通道
6. 若使用了HTTPS协议，则进行SSL握手，建立加密信道。检验HTTP2. 0
7. 浏览器附带需要的Cookie。
8. 设置请求头、协议版本、cookie等，发出HTTP GET请求
9. 服务器处理请求，完成处理后，响应一个HTTP报文给浏览器
10. 浏览器基于协议版本，`Connection`字段，决定是否关闭连接，如果关闭，四次挥手
11. 浏览器根据响应的状态码, 具体处理，比如重定向
12. 浏览器基于响应头完成缓存、Cookie设置
13. 浏览器基于`Content-Type`字段，决定如何解析响应内容, 如果是`text/html`，则开始解析HTML
14. 从上到下解析HTML，如遇到外部资源，则进一步请求资源，其中CSS会预加载，JS会阻塞解析
15. 解析HTML过程中，依次生成`DOM树`、`CSSOM树`、合成两者为渲染树`Render树`，然后进行布局`Reflow/Layout`,计算每个节点的严格几何信息、绘制（包括分块、光栅化和绘制等过程）
16. 解析过程中会触发一系列事件，如`DOMContentLoaded`、`load`等
  - `DOMContentLoaded`:当DOM树构建完成时触发，不等待CSSOM、图片和子框架`iframe`的加载完成, 此时可以操作DOM元素，但避免操作style
  - `load`:当页面所有资源（包括图片、样式表、脚本等）都加载完成后触发，此时页面完全可用
  
  ```javascript
    // 监听DOM解析完成
    // document = 文档相关事件
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM解析完成，可以操作DOM元素');
    });

    // 监听页面完全加载
    // window = 窗口/页面全局相关事件
    window.addEventListener('load', function() {
        console.log('页面完全加载完成');
    });
  ```






