---
title: '开发时构建性能优化'
date: 2025-06-23
tags:
  - 前端工程化

---

> 打包优化是前端工程化中的一个重要环节，它可以帮助我们提高代码的性能和效率，这里捋捋开发时的构建性能优化。


## 打包性能优化
    
打包场景下的性能指标
    
1. 开发阶段的构建性能：构建越快越好，*按需构建*，*缓存复用*
    
2. 生产阶段的传输性能：传输越快越好, *打包结果体积越小越好* *文件数量优化* *利用浏览器缓存*
    
## 1. 减少模块解析

### 只解析有依赖其他模块的模块
> 核心：显示指定不需要解析的模块
    
**模块解析**
模块解析是指webpack从entry开始，**递归地解析依赖的模块**，并生成依赖图谱的过程。
    
    
**不解析模块，可以构建时间**
如果不做模块解析，那文件内容读取后，loader处理后，直接就保存下来，作为最终的资源；如果不使用loader，那源码就是打包结果。    
    
    
**不需要解析的模块**
1. 模块中没有其他依赖，比如`lodash` `moment`等独立包

    
**配置不需要解析的模块**
```js
  // webpack.config.js
  module.exports = {
      module: {
          noParse: /^(lodash|moment)$/,
      }
  }
```

## 2. 优化loader性能

### 只处理需要的文件
    
> 核心：限制loader的应用范围，非必要不使用。
    
比如`babel-loader`,对于`loadash`这样的库，不需要再使用babel进行转换，可以配置`exclude`
`node_modules`中的第三方包，大部分是已经转换过的，不需要再使用babel进行转换

```js
  // webpack.config.js
  module.exports = {
    module: {
      rules:[
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        // 或
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
          use: 'babel-loader',
        }
      ]
    }
  }

```

### 缓存loader的结果
    
ts-loader、babel-loader、eslint-loader 等都是耗时loader
> 核心：loader转换过的内容，缓存起来，复用没有变化的文件
    
`cache-loader` 是 Webpack 中一个用于`缓存 loader 执行结果`的工具。它会将经过耗时的 loader（如 babel-loader、ts-loader）处理后的结果缓存到磁盘中，当下次构建时如果文件没有变化，就直接从缓存中读取，避免重复处理。
    
```js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            'cache-loader',// 通常放在其他耗时的 loader 前面（顺序从右往左执行）
            'babel-loader',
          ],
          include: path.resolve('src'),
        },
      ],
    },
  };
```

```js
  // webpack5 中的持久化缓存
  module.exports = {
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename], // 当配置改变时，缓存失效
      },
    },
  };
```


### loader多线程运行
    
`thread-loader`是 Webpack 中用于 **多线程打包构建** 的一个 loader，它可以将耗时的 loader 放在一个独立的 worker 线程中运行，从而提升构建性能。
    
在 Webpack 的 `rules` 中使用 `thread-loader`，通常放在其他耗时的 loader 前面
    
缺点：
- 新线程里的loader无法使用webpack的api，无法访问配置
- 线程的创建销毁和通信成本也消耗时间
    
```js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'thread-loader',
              options: {
                workers: 3,
              },
            },
            'babel-loader',
          ],
          include: path.resolve('src'),
        },
      ],
    },
  };
```



## 3. 热模块替换（HMR）

### webpack 开启HMR
    
在webpack.config.js中开启HMR
```js
  module.exports = {
    devServer: {
      hot: true,
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(), // 热替换插件
    ]
  }
```
    

在代码中开启HMR
```js
  if (module.hot) {
    module.hot.accept();
  }
```

### HMR 的实现原理 🔧
    
在开发时，webpack-dev-server 通常经历了下面这样一个工作流
    
- 持续监听代码变化

- 代码变化
- 重新打包
- 浏览器请求资源
- 浏览器执行代码
- 代码变化.........

---
    
具体地：

1. WebSocket 连接
webpack-dev-server 和浏览器之间建立 WebSocket 连接，用于实时通信。

2. 文件监听
webpack 监听源代码文件的变化，当文件发生变化时：
- webpack 重新编译变化的模块
- 生成新的模块代码
- 计算模块差异（hash）

3. 通知机制
```js
// webpack-dev-server 通过 WebSocket 向浏览器发送消息
{
  type: 'ok',
  hash: 'newHash123',
  modules: ['./src/components/Button.js']
}
```

4. 模块更新流程
```js
// 浏览器端的HMR运行时
if (module.hot) {
  // 1. 检查是否有更新
  module.hot.check().then(outdatedModules => {
    if (outdatedModules) {
      // 2. 应用更新
      return module.hot.apply({
        ignoreUnaccepted: true
      });
    }
  }).then(updatedModules => {
    // 3. 更新成功，页面状态保持
    console.log('HMR 更新成功');
  });
}
```

#### CSS 模块的 HMR
```js
// style-loader 自动支持 CSS HMR
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
```

---


