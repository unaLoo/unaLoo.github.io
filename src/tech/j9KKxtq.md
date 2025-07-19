---
title: 'Webpack构建流程'
date: 2025-06-23
tags:
  - 前端工程化

---

> webpack构建流程


## Webpack构建流程概述

Webpack 是一个模块打包工具，核心目标是把项目中的所有前端资源（JavaScript、CSS、图片、字体等）都视为**模块**。它会从一个或多个**入口文件 (Entry Points)** 开始，递归地构建一个**依赖图 (Dependency Graph)**，然后将图中的所有模块打包成浏览器可用的静态资源文件。

整个构建流程大致可以分为以下几个核心阶段：

1.  **初始化 (Initialization)**
2.  **构建模块 (Building Modules)**
3.  **优化 (Optimization)**
4.  **输出 (Output)**

---

## 构建流程

### 1. 初始化阶段 (Initialization)

这是 Webpack 启动，准备构建环境的第一步。

* **加载配置：** Webpack 首先会读取 `webpack.config.js` 文件以及命令行参数。这个配置文件定义了入口、输出、加载器 (Loaders)、插件 (Plugins) 等关键信息。
* **创建 Compiler 实例：** 根据配置，Webpack 会创建一个 `Compiler` 实例。`Compiler` 是 Webpack 的核心引擎，负责整个构建生命周期，它会暴露各种**钩子** (Hooks) 供插件注册和扩展，比如`beforeCompile`、`afterCompile`、`make`等。
* **注册插件：** `Compiler` 实例会注册配置中定义的所有`Plugin`。插件通过监听 `Compiler` 暴露的这些钩子，在构建流程的不同阶段执行自定义任务（如资源优化、注入环境变量等）。

### 2. 构建模块阶段 (Building Modules)

这是 Webpack 最核心、最复杂，也是实现“从入口文件找到所有依赖模块”的关键阶段。

* **2. 1 从入口文件开始：**
    * `Compiler` 实例会根据配置中的 `entry` 属性，确定一个或多个**入口模块**。
    * Webpack 从这些入口模块开始，进入构建流程。每个入口模块都会被添加到**模块依赖图**中。

* **2. 2 模块解析与加载：**
    * 对于每个待处理的模块（包括入口模块和后续发现的依赖模块），Webpack 会做以下几件事：
        * **解析 (Resolve)：** 根据模块的**路径**（相对路径、绝对路径、Node.js 模块路径等）以及配置中的 `resolve` 规则（如 `alias`、`extensions`），找到模块的**绝对路径**。
        * **加载 (Load)：** 根据模块的绝对路径，读取其文件内容。

* **2. 3 使用 Loader 转换模块内容：**
    * 读取到的模块内容可能不是标准的 JavaScript（例如 TypeScript、SCSS、图片等）。
    * Webpack 会根据配置文件中定义的 `module.rules`，找到匹配该模块文件类型的**Loader**。
    * **Loader 的原理：** Loader 是一个转换器，它接收模块的源代码作为输入，然后对其进行转换，最后输出新的源代码。一个模块可以经过多个 Loader 的链式处理。
    * **示例：**
        * `.ts` 文件：`ts-loader` 将 TypeScript 转换为 JavaScript。
        * `.scss` 文件：`sass-loader` 将 SCSS 转换为 CSS，`css-loader` 将 CSS 转换为 JavaScript 模块，`style-loader` 将 JS 模块中的 CSS 注入到页面 `<style>` 标签。
        * 图片文件：`file-loader` 或 `url-loader` 处理图片，生成 URL 或 Data URL。
    * **转换结果：** 经过 Loader 处理后，所有非 JavaScript 的资源最终都会被转换为 JavaScript 模块或可以在 JavaScript 中引用的形式。

* **2. 4  AST 解析与依赖查找：**
    * **原理：** 经过 Loader 转换后的 JavaScript 模块代码，Webpack 会使用 JavaScript 解析器（如 Acorn）将其解析成一个**抽象语法树 (AST - Abstract Syntax Tree)**。
    * **遍历 AST：** Webpack 会遍历这个 AST，查找所有的**依赖声明**。这些依赖声明包括：
        * `import 'module'`
        * `require('module')`
        * `import('./dynamic-module')` (动态导入)
        * `new Worker()` (Web Worker)
        * 甚至 CSS 中的 `@import` 或图片路径 `url(...)`（如果使用了相应的 Loader，如 `css-loader`）。
    * **递归构建依赖图：** 每当 Webpack 发现一个依赖时，它会将其添加到一个**待处理模块列表**中。如果这个依赖还没有被处理过，Webpack 会重复上述的“解析-加载-Loader转换-AST解析”过程，直到所有的依赖都被找到并处理完毕。
    * 这个递归查找和处理的过程，最终会形成一个**完整的、包含所有模块及其依赖关系的依赖图**。

### 3. 优化阶段 (Optimization)

一旦所有模块都被加载和转换，并构建了完整的依赖图，Webpack 就会进入优化阶段。

* **Tree Shaking：**
    * **原理：** 静态分析代码，移除项目中未被使用的代码（即“死代码”）。它依赖于 ES6 模块的静态特性（`import`/`export`）。标记清除。
    * **作用：** 减少最终打包文件的大小。
    * **示例：**
        * `import { funcA } from './module.js';` 在treeshaking时会移除module.js中未被使用的其他函数
* **代码分割 (Code Splitting)：**
    * **原理：** 将大的 Bundle 拆分成多个小的 Bundle。可以根据路由、组件或公共依赖进行分割。当需要时才加载对应的 Bundle。
    * **作用：** 减少初始加载时间，按需加载资源。
* **Scope Hoisting (作用域提升)：**
    * **原理：** 在生产模式下，Webpack 会尝试将多个模块合并到一个函数作用域中，减少模块闭包的开销。
    * **作用：** 减少打包文件体积和运行时开销，提高执行效率。
* **HMR (Hot Module Replacement) 相关优化：**
    * 在开发模式下，HMR 允许在不刷新整个页面的情况下，只替换更新的模块，保持应用状态。
* **各种插件的优化：**
    * **UglifyJsPlugin / TerserPlugin：** 压缩和混淆 JavaScript 代码。
    * **MiniCssExtractPlugin：** 将 CSS 从 JS Bundle 中抽离成单独的 CSS 文件。
    * 其他自定义优化插件等。

### 4. 输出阶段 (Output)

最后，Webpack 将优化后的模块打包成最终的输出文件。

* **生成 Bundle 文件：** 根据配置中的 `output` 属性，将所有处理好的模块组合成一个或多个最终的 Bundle 文件（例如 `bundle.js`, `main.css` 等）。
* **写入文件系统：** 将生成的 Bundle 文件写入到指定的输出目录中。
* **生成 HTML 模板 (可选)：** 如果使用了 `HtmlWebpackPlugin`，还会生成一个包含所有引用资源的 HTML 文件。

---

## WebPack 如何找到所有依赖的模块？

Webpack 从**入口文件**开始，通过以下步骤递归地找到所有依赖的模块：

1.  **从入口文件出发，读取其内容。**
2.  **如果文件类型是非 JavaScript（如 TS, SCSS, 图片），它会根据配置规则调用相应的 Loader 进行转换，直到转换为 JavaScript 代码或可以在 JavaScript 中引用的形式。**
3.  **使用解析器将 JavaScript 代码解析成 AST (抽象语法树)。**
4.  **遍历 AST，查找所有 `import`、`require()` 等依赖声明语句。**
5.  **对于每个发现的新依赖，如果它还未被处理，Webpack 会将其添加到待处理队列，并重复上述 2-4 步骤，直到所有可达的模块都被发现并处理。**
6.  **最终，所有被发现的模块以及它们之间的依赖关系构成了一个完整的依赖图。**

这个递归的 AST 解析和依赖查找机制，是 Webpack 能够实现**模块化、代码分割、Tree Shaking**等高级功能的基础。它使得开发者可以只关注模块间的逻辑关系，而无需手动管理文件的引入顺序和依赖。



