---
title: 'Vue 理解和认识'
date: 2025-06-27
tags:
  - 前端框架

---

> 啥是Vue, Vue的核心特性

## 1. web开发历史发展

- 纯静态页面

- ASP，JSP，PHP等，服务端渲染

- 前后端分离，Jquery + Ajax 异步请求，局部页面刷新，用户体验好

- SPA 单页面应用，基于hash路由 / 基于history路由, 但各种VM绑定，数据管理麻烦

- 各类SPA框架，如React，Vue，Angular等

## 2. Vue
- Vue 是一个用户创建SPA应用的开源框架
- 关注MVC中的View层，能够简化Web开发，方便地实现view和model的交互
- 最早在2014年由尤雨溪发布，2016年发布2. 0版本，2019年发布3. 0版本，现在已经是3. 5版本

## 3. Vue 核心特性

### 3. 1 MVVM模式 / 声明式渲染

**MVC？**  
MVC 是 `Model-View-Controller` 的缩写，是一种常见的（后端）软件架构模式，它将应用程序分为三个部分：

- **Model（模型）**：负责业务数据（如数据库模型、实体类等）
- **View（视图）**：负责界面展示（如 HTML、JSP 页面）
- **Controller（控制器）**：负责接收用户输入，调用 Model 更新数据，选择合适的 View 返回

在早期前后端一体的项目中（如 JSP + SpringMVC），Controller 接收请求，Model 处理数据，View 是服务端渲染出来的页面（如 JSP）。
而在前后端分离架构中，Controller 往往直接返回 JSON 数据，前端（Vue/React）再根据数据渲染 View。

---

**MVVM？**  
MVVM 是 `Model-View-ViewModel` 的缩写，是**前端**常用的架构模式，尤其适用于 Vue 和 React 这类响应式框架。

- **Model（模型）**：保存业务数据（如组件中的 `data`）
- **View（视图）**：界面层（DOM）
- **ViewModel（视图模型）**：Vue 的核心，负责**连接 Model 和 View**，实现数据**双向绑定、状态同步、事件响应**等

📌 ViewModel 就是 Vue 的实例对象，它让：
- 数据变化自动更新到 DOM（响应式绑定）
- DOM 变化能自动反馈给数据（v-model 双向绑定）

MVVM 的核心优势就是：
✅ 解耦视图与数据  
✅ 实现“**声明式渲染**”  
✅ 极大简化了前端开发者手动操作 DOM 的成本



### 3. 2 响应式系统
响应式系统是实现MVVM模式的关键，它让数据的变化自动更新到DOM，DOM的变化能自动反馈给数据。

vue2中，响应式系统是基于Object.defineProperty实现的, data中的数据被劫持，当数据变化时，会通知视图更新。`data` `computed` `watch`

vue3中，响应式系统是基于Proxy实现的, 支持对象、数组、Map、Set 等复杂类型的响应式处理，性能更好。`reactive` `ref` `computed` `watch`








### 3. 3 组件化开发

组件广义上来说是可复用的代码块，在Vue中，每个.vue文件就是一个组件，组件化有以下好处：
- 调试方便，容易定位问题
- 每个组件职责单一，方便维护
- 提高开发效率，复用性高

### 3. 4 模板语法和指令系统 

模板语法主要是在template中，通过双花括号来绑定数据。

vue中，指令(Directives)是带有前缀v-的特殊属性:当属性值改变时，指令会自动更新DOM。   
    
常用指令：
- v-if
- v-for
- v-bind (:)
- v-on (@)
- v-model



## 4. Vue 和 React 对比

> Vue 更适合“上手快 + 结构清晰 + 模板直观”的场景；React 更偏“灵活扩展 + 函数式思想 + 工程化”开发


| 维度                | Vue                                 | React                                    |
| ----------------- | ----------------------------------- | ---------------------------------------- |
| **框架类型**          | 完整框架（渐进式）                           | UI 库（核心关注视图层）                            |
| **开发者**           | 尤雨溪主导，MIT 开源                        | Facebook（Meta）主导，MIT 开源                  |
| **学习曲线**          | 更容易快速构建应用                           | 更偏工程化，学习成本稍高                             |
| **语法风格**          | 模板 + 指令                             | JSX + JavaScript                         |
| **组件书写**          | SFC 单文件组件（`.vue`）                   | JSX 写法（`.jsx` / `.tsx`）                  |
| **响应式系统**         | Vue3 使用 Proxy（自动追踪依赖）               | 使用 useState/useEffect 手动控制更新             |
| **双向绑定**          | 支持 v-model                   | 不支持，需手动绑定 onChange/value                 |
| **生命周期**          | 类似传统生命周期名，如 `onMounted`             | 使用 Hooks（`useEffect`, `useLayoutEffect`） |
| **状态管理**          | Vuex / Pinia                   | Redux、Zustand 等多选项                 |
| **路由管理**          | 官方 Vue Router                       | React Router                       |
| **服务端渲染（SSR）**    | Vue SSR / Nuxt                      | React SSR / Next.js                      |

## 参考资料
- [web-interview](https://github.com/febobo/web-interview){target="_blank" rel="noreferrer"}
- [Vue.js](https://vuejs.org/guide/introduction.html){target="_blank" rel="noreferrer"}
