---
title: '逛牛客看面经有感'
date: 2025-06-15
tags:
  - 感悟
---

> 逛牛客看面经，看看别人面试被问啥了，反思自己还有哪些需要准备和夯实的。写得可能比较乱哦，看到我就记下了。
    

## 框架底层实现和使用相关的问题

- tailwind原子化样式如何避免类名冗余？
- Vue/React区别
- Vue 响应式、单向数据流、vmodel、组件通信、模板系统、diff算法
- React
  - 说下React的核心原理？
  - 为什么要引入虚拟DOM？为什么不直接操作DOM？
  - 使用虚拟DOM之后就不会触发重排了吗？
  - 比如说我有一个列表，它有十个元素发生了变化，它其实会产生10个patch，对吗？是应该打1个patch还是10个patch？
  - fiber是怎么样去实现的？

- 小程序的大致实现方式？设计思路？


## 浏览器/NODE/JS底层相关问题

- 浏览器tab页面间如何通信？
- JS的内存回收机制， 垃圾回收算法？
- 浏览器缓存（强缓存、协商缓存........）
- 浏览器如果断网了如何处理
- array底层实现？手写map
- Array.prototype.sort的实现和稳定性？

## 计算机基础
- 线程进程
- 原码、反码、补码....

## 计算机网络相关问题

- HTTPS？ HTTPS加密是怎么做的？证书？
- HTTP2. 0? 有哪些优化，使用HTTP2. 0有哪些前置条件
- 浏览器输入url到页面渲染的过程（网络、页面渲染、缓存这些点）
- DNS解析过程，状态码
- 跨域
- 加密
- cookie和session和JWT的区别
- localStorage和sessionStorage和cookie的区别


## 性能优化类问题
- 大量数据要渲染，如何解决？ （虚拟滚动？原理）
- 讲讲对SSE（Server-Sent Events）的理解
- 讲讲SSR（Server-Side Rendering）


## 构建工具/工程化相关问题
- 构建工具实现热更新原理？
- webpack 和 vite 区别
- webpack构建流程


## 应用场景类,
- 单点登录如何实现 sso 是啥
- ts枚举量的正向映射和反向映射
- defer async

## JS，TS类问题
- 数组转树
- 字符串识别，正则
- async捕获错误
- .d.ts是干嘛的
- 泛型
- 事件 有没有哪些事件不会冒泡？


## GIT相关问题
- 如何合并多个提交


## HTML/CSS相关
- 跨端如何实现样式兼容
- 动画
- 定位
- 语义化标签
- 水平垂直居中
- 优先级


## 新东西
- 微前端
- Flutter


## 一些没听过但好像还挺牛逼的公司
- momenta(自动驾驶)
- minimax(AI，21年初创) [招聘链接](https://vrfi1sk8a0. jobs.feishu.cn/379481/position/list?keywords=%E5%89%8D%E7%AB%AF&category=&location=&project=&type=&job_hot_flag=&current=1&limit=10&functionCategory=&tag=&share_token=MzsxNzQ1ODMwMzQ3NjI5Ozc0OTgyODI3NTMyODI1MDkxMDY7MDsxLzI)