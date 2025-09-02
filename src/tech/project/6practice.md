---
title: 实践
date: 2025-06-29
tags:
  - 前端工程化
---
# webpack practice

## 从0开始, 配置一个 ts 项目

1. `npm init` 初始化项目，装 `webpack` `webpack-cli` `ts-loader`
2. webpack.config.js
3. npx tsc --init ， 生成 tsconfig
	1. 注意配置 `"rootDir": "./src"`
	2. 注意配置 `"module": "esnext"`
	3. `"declaration": false` 和 `"declarationMap": false` 这俩是避免生成.d.ts的
4. 安装 tsloader，并配置 webpack module
5. 配置 webpack resolve `extensions: ['.ts', '.js', '.json']`
6. 写测试代码，`index.ts`  `xx.ts` 并引入
7. webpack 打包，`npx webpack --mode=development`
![](../../assets/Pasted%20image%2020250901223412.png)
> 由此，我们可以看到，vue-cli 估计也是类似的手段，只不过把这些配置变成了模板，提前初始化了某些配置。
> 不过这样大概走一遍还是很重要的，比如发现了 resolve 和 ts `allowImportingTsExtensions` 的坑；tsc 默认import是没有后缀的,需要配置resolve 拓展名规则。

## webpack plugin

Plugin是 webpack 生态的关键部分， 它为社区用户提供了一种强有力的方式来直接触及 webpack 的编译过程(compilation process)。 插件能够 [hook](https://www.webpackjs.com/api/compiler-hooks/#hooks) 到每一个编译(compilation)中发出的关键事件中。 在编译的每个阶段中，插件都拥有对 `compiler` 对象的完全访问能力， 并且在合适的时机，还可以访问当前的 `compilation` 对象。

### practice

🖐Wait!!

先不说`api`，先想想，这个插件大致是什么形式？才能够给webpack的生命周期赋能。
- 他大概率是个类的形式，这样方便`webpack`去规范使用
- 他肯定得可以传入`props`吧，或者叫`options`，支持一些插件行为的配置
- 他肯定有个方法，能够接受webpack在编译时传递的一些上下文参数

👀 让我们看看官方文档

> 在 webpack 中的许多对象都扩展自 `Tapable` 类。 它对外暴露了 `tap`，`tapAsync` 和 `tapPromise` 等方法， 插件可以使用这些方法向 webpack 中注入自定义构建的步骤，这些步骤将在构建过程中触发。

>webpack **插件**是一个具有 [`apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) 方法的 JavaScript 对象。`apply` 方法会被 webpack compiler 调用，并且在 **整个** 编译生命周期都可以访问 compiler 对象。

下面是官方给的一个插件的例子，很简单，就是实现一下 apply 方法，在其中调用 [hooks](https://www.webpackjs.com/api/compiler-hooks/#hooks) 即可。

```javascript
const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.run.tap(pluginName, (compilation) => {
      console.log('webpack 构建正在启动！');
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin;
```

### 实现 DistCleanUpPlugin

```js
const fs = require('fs')

class CleanOutputPlugin {
  constructor(options) {
    this.options = options || {}; // 插件的配置项
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tap('CleanOutputPlugin', (compiler) => {
      // 清除dist,在beforeRun
      const webpackOutputPath = compiler.options.output.path
      if (fs.existsSync(webpackOutputPath)) {
        fs.rmSync(webpackOutputPath, { recursive: true, force: true })
        console.log('清除目录,', webpackOutputPath)
      }
    })
  }
}

function cleanOutputPlugin(options) {
  return new CleanOutputPlugin(options)
}

module.exports = cleanOutputPlugin;
```

## loader practice

### loader

loader 可以使你在 `import` 或 "load" 模块时**预处理**文件。因此，loader 类似于其他构建工具中“任务(task)”，并提供了处理前端构建步骤的得力方式。loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。loader 甚至允许你直接在 JavaScript 模块中 `import` CSS 文件！

### 需求

有这样一个场景，加载glsl。我们在写glsl的时候，通常就是用字符串内联的形式直接书写glsl，这样的话，一些ide的语法提示插件就难以识别，开发体验差；另一种方式就是放在静态文件目录下，作为一个外部资源加载进来，这样就需要所有的过程都是异步的，没有了同步的体验。

虽然这个请求很小，也不说耗资源什么的，但是可以以这一个场景，学习如何写一个loader，让 webpack 能够解析，让我们在开发时可以通过 import 这样的方式来引入 loader，避免了异步请求，也避免了内联字符串。

### 实践

- 我们在用其他的`loader`的时候，`webpack`中的配置是通过 `use: { loader: 'babel-loader' }` 这种字符串的方式说明我们要的包，实际上，这里也可以是一个路径，一些 `option` 也可以从这里传进来。
- loader 是文件级别的处理，那么他肯定包含一个方法，接受原始文件内容，然后通过某种解析方式，将其变换归置为一个符合模块化规范的形式。

```js
/**
 *
 * @param {string|Buffer} content 源文件的内容
 * @param {object} [map] 可以被 https://github.com/mozilla/source-map 使用的 SourceMap 数据
 * @param {any} [meta] meta 数据，可以是任何内容
 */
function webpackLoader(content, map, meta) {
  // 你的 webpack loader 代码
}
```

通过这种形式，我们可以很容易实现一个自定义`loader`, `this.getOptions`可以拿到config中传入的配置。

```js
module.exports = function (source) {
	// 拿到 option
    const options = (typeof this.getOptions === 'function') ? this.getOptions() || {} : {};
    // 压缩
    if (options.minify === true) {
        const lines = source.split('\n');
        source = lines
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .filter(line => !line.startsWith('//'))
            .map(line => line.replace(/\s+/g, ' ')).join('\n')
    }
    // 返回
    return `module.exports=${JSON.stringify(source)};`
};
```

然后在外边用即可。
```js
const path = require('path');
module.exports = {
	// ...
    module: {
        rules: [
            {
                test: /\.(glsl|wgsl)$/,
                use: {
                    loader: path.resolve(__dirname, '../src/shaderLoader.js'),
                    options: {
                        minify: true, // default is false
                    }
                },
            },
        ],
    },
};
```


踩坑：
ESM 和 CJS