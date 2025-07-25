---
title: '虚拟DOM与Diff'
date: 2025-06-27
tags:
  - 前端框架

---

> 虚拟DOM

## 1. 虚拟DOM

虚拟DOM是一种优化性能的技术，它可以减少DOM操作的次数，提高页面的渲染效率和用户体验。Vue使用虚拟DOM来实现快速响应和流畅的界面交互。

### 1. 1 是什么
虚拟DOM是一个JS对象，它描述了真实DOM树的*结构、属性与事件*，是**真实DOM的轻量级副本**   

### 1. 2 怎么用
当数据变化时，生成新的虚拟DOM，然后通过*Diff算法*，与旧的虚拟DOM树对比，找出差异，然后更新真实DOM   

### 1. 3 为啥用
- **提高性能**
  - 频繁的DOM操作会使浏览器多次进行**重排(回流)和重绘**，影响性能。   
  - 在运行时通过使用虚拟DOM结合Diff算法，可以通过**批量更新**与**最小化更新**等策略来减少DOM操作，提升性能。
- **提高开发效率**
  - 通过虚拟DOM，让Vue去操作DOM，实现`MVVM`，实现**声明式渲染**
  - 开发者只需要关注数据的变化，而不需直接进行DOM操作
- **跨平台潜力**
  - 虚拟DOM本质上是JS内存中的对象，独立于浏览器环境
  - 可以方便地在任何支持JS的平台进行开发，如在Node.js中进行服务端渲染

### 1. 4 vue咋用的

> 通过创建虚拟DOM树来实现虚拟DOM和实际DOM的**分离**
> 通过Diff算法找到需要更新的节点，然后将这些节点更新到真实的DOM上，实现了虚拟DOM与实际DOM的**衔接**

在编译时，我们通过编写`template`模板，然后Vue会将其编译为一个返回虚拟DOM的render函数。   
在运行时，当数据发生变化时，Vue会调用render函数，生成新的虚拟DOM，然后通过Diff算法找差异，针对部分差异更新真实DOM`patch`

### 1. 5 虚拟DOM一定比真实DOM快吗

**首先两者的性能瓶颈是啥？** 
- 真实DOM的性能瓶颈，是因为浏览器引擎的频繁**重排**（Reflow/Layout）和**重绘**（Repaint）
- 虚拟DOM的性能瓶颈，是引文**虚拟 DOM 的额外内存**以及 **Diff 算法**的计算时间

**总结：**
- 在**复杂且数据频繁变化的场景**下，虚拟 DOM 能通过高效 Diff 算法和批量更新策略，最大限度地减少真实 DOM 操作的次数和范围，从而避免了浏览器的频繁重排和重绘，最终带来更稳定、更流畅的性能表现。
- 在**简单、静态或更新频率极低的场景**下，直接操作真实 DOM 可能反而更快，因为虚拟 DOM 会引入不必要的存储和计算开销。


### 1. 6 拓展：无虚拟DOM的Svelte框架
如 React、Vue 等框架是在运行时通过虚拟 DOM 进行差异对比，然后更新真实 DOM。       
而 Svelte 的核心思想是在编译时就**把组件代码转换成高效、命令式的 JavaScript 代码**，直接操作真实 DOM。



## 2. 从template到虚拟DOM

编译时`Build-time`：模板 -> 渲染函数 (由 Vue 内置的Compiler模块完成)

运行时`Runtime`：渲染函数 -> 虚拟 DOM -> Diff 比较 -> 更新真实 DOM (由 Vue 运行时系统完成)

### 2. 1 编译过程


1. 解析（parse）：将模板字符串解析成 AST（抽象语法树）。
2. 静态分析（static analysis）：对 AST 进行静态分析，标记出其中的静态节点（Static Node）。
3. 优化（optimize）：遍历 AST，对静态节点（在组件生命周期中不会发生变化的节点）进行优化，去掉不必要的操作。
4. 代码生成（code generation）：将 AST 转换成一个JS渲染函数(render function)。

---

### 2. 2 大概的样子

- 有这么一个 vue sfc
  ```vue
    <div id="app">
      <input v-model="message" />
      <p>{{ message }}</p>
    </div>
  ```

- 编译后，生成的render函数大概是这样
  ```js
  // 渲染函数本身
  function render(_ctx, _cache) {
    // _ctx 代表组件实例的上下文，你可以通过它访问 data 属性，如 _ctx.message
    // _cache 用于缓存事件处理函数，避免不必要的重复创建

    return (
      // openBlock() 和 createElementBlock() 组合用于创建优化的元素块
      // 对应 <div id="app">
      openBlock(), createElementBlock("div", { id: "app" }, [

        // withDirectives 用于包裹带有指令的元素
        // 对应 <input v-model="message" />
        withDirectives(
          createElementBlock("input", {
            // v-model 最终会转换为 value 绑定和 input 事件监听
            // _ctx.message 是当前 message 的值
            value: _ctx.message,
            // _cache[0] 是一个缓存的事件处理函数，它会在 input 事件触发时更新 _ctx.message
            // 实际代码还要处理 value、composition event 等
            onInput: _cache[0] || (_cache[0] = $event => (_ctx.message = $event.target.value))
          }),
          // vModelText 是 v-model 指令的具体运行时实现
          [[vModelText, _ctx.message]]
        ),

        // 对应 <p>{{ message }}</p>
        createElementBlock("p", null, toDisplayString(_ctx.message)) // null 表示没有属性
      ])
    );
  }

  ```


- 运行时,生成的虚拟DOM大概是这样
  ```js
  {
    type: 'div',
    props: { id: 'app' },
    children: [
      {
        type: 'input',
        props: { value: 'Hello Vue!', onInput: /* 缓存的事件处理函数 */ },
        // 其他 v-model 相关的内部属性
      },
      {
        type: 'p',
        props: null,
        children: 'Hello Vue!' // 文本节点
      }
    ]
  }
  ```

## 3. Vue2 的 Diff 算法

Vue2 的 Diff 算法基于**双端比较 + 暴力查找**，大致流程如下：

- **双端比较 `Diff Children`**
  - 目的是最大化地找到可复用的节点，减少DOM操作次数
  - 维护四个指针：oldStartIdx, oldEndIdx, newStartIdx, newEndIdx，分别指向旧子节点数组和新子节点数组的首尾。
  - 通过这四个指针的不断移动和比较，尝试四种匹配方式（旧头对新头、旧尾对新尾、旧头对新尾、旧尾对新头），以最快速度找到可复用的节点
    
- **暴力查找移动**
  - 如果双端匹配无法找到复用节点，则使用暴力解法
  - 基于旧节点建哈希表，遍历新子节点中的剩余项，尝试在哈希表中匹配项有没有可用的旧节点
  - 如果找到匹配项，则将其移动到正确的位置，并进行 patchVnode
  - 如果找不到匹配项，才会创建一个新的 Vnode
    
- **处理剩余节点**
  - 剩余地旧节点需要删除
  - 剩余的新节点需要创建和插入
    
---

**小结**
- 双端比较，最大化找到可复用的节点，减少DOM操作次数
- 暴力比对剩余节点，再尝试找可复用节点
- 燃尽了，删除旧节点，创建新节点
- 更新真实DOM

![vue2-diff](/post-assets/vue2Diff.png)
图源：[掘金：说说 vue2 和 vue3 核心diff算法](https://juejin.cn/post/7092068900589797413)

## 4. Vue3 的 Diff 算法
Vue3 的 Diff 算法称之为快速 Diff 算法，基于**双端比较 + 最长递增子序列 (LIS)**，大概是这样子：
    
- **双端比较策略沿用**：在比对新旧DOM树时，首先旧头对新头、旧尾对新尾的双端比对策略是沿用下来的。

- **中间比对优化**
  1. 计算**新旧节点映射关系**。遍历新节点建哈希表，然后遍历旧节点，填表，该删的删。结果表中记录了新节点在旧节点中的索引。
  2. 计算出**最长递增子序列(LIS)**。这个LIS中的节点，表示它们在新旧列表中**相对顺序保持不变**，是“稳定”的节点，不需要进行 DOM 移动操作。
  3. **最小化移动**：那些**不在LIS中的节点**，才会被识别为需要进行 DOM 移动的节点。Vue 3 会精确地将这些节点移动到它们在新列表中的正确位置。
    
- **处理剩余节点**
  - 剩余地旧节点需要删除
  - 剩余的新节点需要创建和插入

![vue3-diff](/post-assets/vue3Diff.png)
图源：[掘金：说说 vue2 和 vue3 核心diff算法](https://juejin.cn/post/7092068900589797413)


## 5. Vue2 和 Vue3 的 Diff 算法对比
Vue 2 和 Vue 3 都使用了虚拟 DOM + Diff 算法来优化页面更新，但它们在 Diff 算法的具体实现和策略上存在显著差异，尤其体现在如何处理子节点列表的更新上。
- Vue 2 ：**双端比较 + 暴力查找**
  - 当遇到大量乱序且中间有变动的列表时，Vue 2 的“暴力查找”机制可能会导致较多的 DOM 移动操作，性能相对较低。
- Vue 3 ：**双端比较 + 最长递增子序列 (LIS)**
  - 引入了最长递增子序列（LIS）算法来专门优化乱序节点的移动，将操作粒度缩小到了最小，大幅减少 DOM 操作。
  - 此外，vue3 还在编译阶段进行了优化，进一步提高性能
    - `PatchFlags`：标记节点是否需要更新, 在编译时，将标记信息嵌入render函数中，在运行时基于标记跳过静态节点。
    - `Block Tree`：区块树，将节点分组，减少Diff的复杂度


## 6. Vue Diff vs React Diff

### 相同点：
- 都基于**虚拟DOM**：它们都维护一个内存中的虚拟DOM树，通过比较新旧虚拟 DOM 树来计算出最小化的真实 DOM 变更。
- 都采用**同层比较**策略： 不会进行跨层级比较。如果一个组件从一个父节点移动到另一个节点下，它们会视为销毁旧的并创建新的，而不是识别为移动。
- 都**基于 key 进行列表优化**： 在渲染列表时，两者都强烈推荐使用唯一的 key 属性。key 帮助 Diff 算法更精确地识别列表中元素的身份，从而高效地处理列表项的添加、删除和移动，最大化地复用 DOM 节点。
- 都进行**批量更新**： 都收集DOM变更，然后批量更新，减少浏览器触发重排和重绘的次数。

### 不同点：
- diff算法不同，react是顺序比较+key辅助
- vue在编译时和运行时都做优化，react是纯运行时优化，虽然JSX被编译为`React.createElement`，但这个过程没有做特定优化，因此开发者需要手动优化，比如`React.memo` `shouldComponentUpdate` `React.PureComponent`等
- 触发更新方式不同，vue基于响应式自动trigger，react通过`setState`手动触发

| 特性           | Vue Diff 算法                                                                        | React Diff 算法                                                              |
| :------------- | :----------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Diff算法** | **Vue 2:** 双端比较 + 暴力查找； **Vue 3:** 双端比较 + **LIS乱序移动优化** | 顺序比较 (`key` 辅助)                                                    |
| **编译时协同** | **高**。编译器提供 `PatchFlags` 和 `Block Tree`，减少运行时 Diff 范围                 | **低**。基本是纯运行时 Diff，无编译时优化信息                                  |
| **更新触发** | **自动细粒度**，基于响应式系统追踪依赖                                               | 默认渲染整个子树，需**手动优化** (`shouldComponentUpdate`/`React.memo`)       |
| **性能** | 在复杂列表场景尤为突出，开发者更“省心”                          | 开发者需要更多手动优化来达到最佳性能                             |




## 参考资料
- [掘金：说说 vue2 和 vue3 核心diff算法](https://juejin.cn/post/7092068900589797413){target="_blank" rel="noreferrer"}