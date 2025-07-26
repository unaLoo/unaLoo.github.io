---
title: 'CommonJS 和 ES Module'
date: 2025-06-23
tags:
  - 前端工程化

---

> CommonJS 和 ES Module 是两种不同的模块化规范，它们在实现方式、使用场景和语法上都有所不同。

## CommonJS

### intro
    
这是一个**社区标准**，核心是`require()`和`module.exports`。
    
内部用一个立即执行函数包裹代码块，导出的东西放在一个对象里，所以是模块化的，**同步的**
    
因为他的核心就是一个立即执行函数

```js
function require(modulePath) {

    if(modulePath in cache) { 
        return cache[modulePath];
    }

    function run(exports, require, module, __filename, __dirname){
        // 模块代码在这里被执行
    }

    var module = {exports: {}};

    run.call(module.exports, module.exports, require, module, __filename, __dirname);

    // 缓存
    cache[modulePath] = module.exports;

    return module.exports;
}

```

### CommonJS 的一个模块里，`this`, `exports`,` module.exports` 的关系 ？
    
三者指向同一个对象，都是 module.exports 
    
尝试分析以下几种情况, 被引入时，require的返回值是什么？导出的模块对象是咋样的？
    
```js
    var d = '3' // 变量提升

    this.a = 1;
    exports.b = 2;
    module.exports.c = 3;
    // require 返回值是 {a: 1, b: 2, c: 3, d: '3'}   
```

---

```js
    this.a = 1;
    exports.b = 2;
    module.exports = {
        a: 'hello',
        b: 'world'
    };
    // require 返回值是 {a: 'hello', b: 'world'}    
```


## ES Module

### intro
    
这是一个官方标准，也有很多新语法，`import` `export`
    
支持动态依赖：在运行时确定依赖关系 `import()` , 结果是 Promise，**是异步的**
    
符号绑定：即便是基本类型，也是引用，对应到同一块内存空间，看下面的变量`a`
    
```js
    // a.js
    export const a = 1;
    export function addA() {
        a += 1;
    }


    // main.js
    import { a, addA } from './a.js';
    import A from './a.js';

    // 解构会开辟新的内存空间
    const {a: paramA } = A;

    console.log(a); // 1
    addA();
    console.log(a); // 2
    console.log(paramA); // 1
```






## 思考

1. 讲讲 CommonJS 和 ES Module 的差异？
    - 社区标准（require） vs 官方标准（import and export）
    - 动态依赖同步执行 vs 动态依赖异步执行
    - 普通对象 vs 符号绑定

2. ESM中 export 和 export default 的区别？
    - export具名导出，可以导出多个
    - export default 默认导出， 一个模块只能有一个默认导出，在模块中名为`default`
