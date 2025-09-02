---
title: 生产环境部署打包优化
date: 2025-06-29
tags:
  - 前端工程化
---

> 生产环境部署打包优化是前端工程化中的一个重要环节

## 部署时的打包优化

- *打包结果体积越小越好* 
- *文件数量优化* 
- *利用浏览器缓存*


## 1. 分包
   
在用webpack打包时，如果不做任何配置，打包结果会是一整个文件。在多个chunck时甚至有重复代码。
   
我们希望进行分包，减少公共代码，降低总包体积，同时充分利用浏览器缓存。

### 手动分包

1. 第三方库/公共模块单独打包

形成manifest.json文件，在打包时，发现已经打包了，就跳过。有点DLL的意味

```js
  // webpack.dll.config.js
  const webpack = require('webpack')
  const path = require('path')

  module.exports = {
    mode: 'production',
    entry: {
      lodash: ['lodash'],
      jquery: ['jquery'],
    },
    output: {
      filename: 'dll/[name].js',
      library: '[name]',
    },
    plugins: [
      new webpack.DllPlugin({
        name: '[name]', // 和output.library一致
        path: path.resolve(__dirname, 'dll', '[name].manifest.json'),
      }),
    ],
  }
```

2. 使用公共模块

在html中**手动引入打包的第三方库结果**
```html
<script src="dll/lodash.js"></script>
<script src="dll/jquery.js"></script>
```


在主配置中
```js
// webpack.config.js
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  plugins: [

    new HtmlWebpackPlugin({
      template: 'index.html',
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./dll/lodash.manifest.json'),
    })
  ]
}
```
优点：
- 极大提升构建速度
- 极大缩小包体积
- 充分利用浏览器缓存

缺点：
- 需要自己维护dll目录文件，包括前置的生成、手动的引入等
- 如果第三方库有更新，需要手动更新dll目录文件
- 如果第三方库本身很小，那分包的意义不大

⚠️ DLLPlugin 适用于大型老项目，在现代项目中推荐使用 Webpack 的缓存机制（如 cache: { type: 'filesystem' }）代替。


### 自动分包

控制自动分包，需要配置分包策略`optimization.splitChunks`

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all', // 所有chunks都进行分包，默认是async，只对异步chunks进行分包
      // maxSize: 20000, // 每个chunk的最大体积, 如果超过这个体积，会进行进一步分包，意义不大
      // minChunks: 2, // 当模块被2个及以上的chunck引用，才进行分包
      // minSize: 10240, // 当模块体积大于10kb时，才进行分包
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          // 这里可以配置 chunks\minChunks\minSize\maxSize等
          priority: 10, // 先打包
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
          priority: -20, // 后打包
        },
        styles:{ // 提取公共css，要配合mini-css-extract-plugin使用
          test: /\.css$/,
          minSize: 1024,
          minChunks: 2,
        }
      }
    },
   
  },
}


```


## 2. 代码压缩

目标：减少代码体积（扰乱代码）
    
**Dead Code Elimination**死代码消除
    
常用工具: 
- `UglifyJS`：因为不支持ES6+语法，所以不推荐
- `Terser`：支持ES6+语法

这里可以在线测试压缩效果 [try Terser](https://try.terser.org/) 

- 有的const就会被优化掉，压缩后直接变成所用之处的常量。
- 各种空格、换行符、注释等可以被压缩掉
- 变量名可以被混淆压缩

webpack内置了terser，如果需要配置，可以参考[terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin){target="_blank" rel="noreferrer"}

```js
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

```

CSS压缩 -- `css-minimizer-webpack-plugin`
```js
// webpack.config.js
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new CssMinimizerPlugin(),
    ],
  },
}
```


## 3. Tree Shaking

**JS Tree Shaking**

代码压缩时，可以移除一些无效的代码，Tree Shaking也是干这个事，移除掉模块中没用的导出。
   
解析代码时，webpack基于ES6的导入导出语法，分析模块的导入导出, 在保证稳定运行的前提下，根据每个模块的每个导出是否被使用来进行 `Dead Code 标记`，最后在打包时，代码压缩工具会移除掉这些Dead Code。

对于一些第三方库，commonjs的模块无法进行TreeShaking，考虑找ESM版本的
    
此外，在package.json中，可以配置`sideEffects`，标记哪些模块有副作用，webpack会认为这些模块的导出不能被TreeShaking, 使用需谨慎。

**CSS Tree Shaking**
本质上是用正则匹配css中的类名，然后移除掉没用到的类名。
- `purgecss-webpack-plugin`  




## 4. 懒加载
这个主要是在开发阶段，在需要的时候再加载模块，让首屏加载的代码体积更小。主要的场景有：
- 路由懒加载
  `const Home = React.lazy(() => import('./pages/Home'))`
- 组件懒加载
  `const MyComponent = defineAsyncComponent(() => import('./MyComponent.vue'))`


## 小结

通过合理的分包、代码压缩、Tree Shaking 和懒加载等手段，可以显著提升前端应用在生产环境的加载速度和用户体验。   
    
此外还可以结合 HTTP/2、服务端渲染（SSR）、CDN 加速等手段进一步优化部署效果。