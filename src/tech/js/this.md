---
title: 'JavaScript this指向'
date: 2025-06-12
tags:
  - JavaScript
---

# this

> this 是 JavaScript 中的一个关键字，它指向当前执行上下文中的对象，此外还有bind、call、apply方法可以改变this指向，本文将深入探讨 `this` 的指向规律、`bind` / `call` / `apply` 的原理与手写实现。

## 一、this 的几种常见指向总结

| 使用方式                        | this 指向                                 | 备注                        |
| --------------------------- | --------------------------------------- | ------------------------- |
| 普通函数调用                      | 全局对象（非严格模式是 `window`，严格模式是 `undefined`） | 默认规则                      |
| 方法调用（obj.fn()）              | `obj`，即调用该方法的对象                         | 常见对象调用                    |
| 构造函数调用（new Fn()）            | 新创建的实例对象                                | 构造函数语义                    |
| 定时器（setTimeout、setInterval） | 全局对象（非严格模式是 `window`，严格模式是 `undefined`） | 默认规则                      |
| 显式调用（call/apply）            | 第一个参数指定的对象                              | 显式绑定                      |
| bind 返回的函数调用                | 永远绑定为指定的对象                              | 固定绑定                      |
| DOM 事件中的普通函数                | 触发事件的 DOM 元素                            | 浏览器中特例                    |
| 箭头函数（非普通函数）                 | 外层作用域的 `this`（词法作用域）                    | 没有自己的 this，会捕获定义时的外层 this |


## 二、 有关this指向的知识点

### 1. 嵌套对象中的this、严格模式与非严格模式的区别
  ```js
    const obj = {
      name: 'outer',
      inner: {
        name: 'inner',
        getName() {
          return this.name;
        }
      }
    };

    console.log(obj.inner.getName()); // inner
    const fn = obj.inner.getName; // 函数赋值后调用，脱离了对象，this指向全局
    console.log(fn()); // 在严格模式下,this为undefined，会报错；非严格模式下，this为window
  ```


### 2. 实战：找找this指向

#### (1) 定时器this指向
```js
  function Normal() {
    this.name = 'Normal';
    setTimeout(function () {
      console.log(this.name); 
    }, 100);
  }

  function Arrow() {
    this.name = 'Arrow';
    setTimeout(() => {
      console.log(this.name); 
    }, 100);
  }

  new Normal();
  new Arrow();

```
**答：**
  - new Normal()中，在定时器中传入了一个普通函数，在到时间，执行函数时，相当于把函数放到全局作用域中执行，所以this指向全局, 在非严格模式下，打印undefined(即window.name);
  - new Arrow()中，传入的是箭头函数，箭头函数会捕获定义时的外一层作用域的 this，所以this指向Normal的this，所以打印Arrow;

#### (2) 构造函数中的this指向
```js
  globalThis.a = 100;
  // 和 var a = 100; 效果一样, 变量提升挂到全局对象上

  function fn() {
    return {
      a: 200,
      m: function () {
        console.log(this.a);
      },
      n: () => {
        console.log(this.a);
      },
      k: function () {
        return function () {
          console.log(this.a);
        };
      }
    };
  }

  const fn0 = fn();
  fn0. m();
  fn0. n();
  fn0. k()();

  const context = {a: 300};
  const fn1 = fn.call(context);
  fn1. m();
  fn1. n();
  fn1. k()();
```

**答：**
  - fn0. m()是典型的对象方法调用，this指向fn0对象，所以打印200;
  - fn0. n()是箭头函数，this绑定到了外层this，即fn函数的this, 即globalThis.a，所以打印100;
  - fn0. k()返回了一个普通函数再执行之，相当于在全局调用普通函数，所以打印100;

  - fn1在创建时，通过call方法，显式指定this指向context对象
  - fn1. m()是对象方法调用，this指向{a,m,n,k}这个对象，所以打印200;
  - fn1. n()是箭头函数,this绑定到了外层this，即fn函数的this，即context对象{ a: 300 }，所以打印300;
  - fn1. k()()同理,this指向全局，打印100;

**补充：**
```js
  globalThis.a = 100
  function fn() {
      this.b = 'abc'
      return {
          a: 200,
          f: () => {
              console.log(this, ' hhha ', this.a)
          }
      }
  }
  obj0 = fn()
  obj0. f() // 全局this , 100
  console.log(obj0) // { a: 200, f: [Function] }

  const context = { a: 300 }
  obj = fn.call(context)
  obj.f() // {a: 300, b:'abc'}, 300
  console.log(obj) // { a: 200, f: [Function] }
```


#### (3) 对象方法中的this指向
> 给箭头函数使用 .call() / .apply() 是不合理的，因为箭头函数的 this 是词法作用域绑定的，无法通过 .call() 强制改变它的 this 指向, 对箭头函数使用 .bind() 同样没有效果。
    
```js

  let name = '!window!'
  globalThis.a = 'asd'
  const person1 = {
      name: 'person1',
      foo1: function () {
          console.log(this.name);
      },
      foo2: () => {
          console.log(this, this.name);
      },
      foo3: function () {
          return function () {
              console.log(this.name);
          };
      }
  };

  const person2 = {
      name: 'person2'
  };
  person1. foo1() // 典型对象调用, person1
  person1. foo1. call(person2) //典型对象调用, person2
  person1. foo2() // 全局this !window!
  person1. foo2. call(person2) // 全局this !window! 箭头函数call你这不搞笑么
  person1. foo3()()//全局this !window!
  person1. foo3. call(person2)() //全局this !window!


```




#### (4) 给对象赋值一个方法
```js
  let length = 10; // let不会进行变量提升，所以window.length不会被影响
  // var length = 10; // var会进行变量提升，所以window.length会被影响

  function fn() {
      return this.length + 1;
  }

  const obj = {
      length: 5,
      test1: function () {
          return fn();
      }
  };

  obj.test2 = fn // 这里给对象赋值了一个方法，这个方法的this指向obj对象（这其实就是call的原理）

  console.log(obj.test1())
  // return fn()也是先执行fn()才返回，fn()在全局执行
  // 打印 window.length + 1 应该是 0 + 1 即页面的iframe窗口数 + 1


  console.log(obj.test2()) // 5 + 1 吧？这里是对象调用了
  console.log(fn() === obj.test2()) // false 
```

## 三、call、apply、bind的原理与手写实现

call、apply、bind是三个Function.prototype上的方法，所以所有函数都可以调用这三个方法。

--- 

关于args的小知识补充：
- args 是“收集多个参数”的方式，它把多个参数打包成一个数组（用来“传入”），而 ...args 是“展开数组”的方式（用来“传出”）
- 剩余参数语法：`function (...args) {}` 是剩余参数语法，它把多个参数打包成一个数组（用来“传入”），在函数体内，args 是一个数组，可以被解构

### 1. call
> func.call(thisArg, arg1, arg2, ...)
> call方法用于调用一个函数, 显式指定this指向和传参并立即执行该函数

```js
  // 实现思路：
  // 在context上，把方法挂载上去，然后调用，调用完删除，就这么简单
  // 需要挂载的属性名不能重复，所以用Symbol
  Function.prototype.myCall = function(context, ...args){
    context = context || window;
    const uniqueID = Symbol();
    context[uniqueID] = this;
    
    const result = context[uniqueID](...args);
    delete context[uniqueID];
    return result;
  }

  globalThis.name = 'global';

  function sayHi(message){
    console.log(message, 'I am ', this.name);
  }

  sayHi('Good morning'); // Good morning I am global
  sayHi.myCall({name: 'John'}, 'hello'); // hello I am John
  sayHi.myCall(null, 'hello'); // hello I am global

```

### 2. apply
> func.apply(thisArg, [argsArray])
> apply方法用于调用一个函数, 显式指定this指向和传参并立即执行该函数
> 和call的区别是传参是数组

```js
  Function.prototype.myApply = function(context, args){
    context = context || window;
    const uniqueID = Symbol();
    context[uniqueID] = this;

    const result = context[uniqueID](...args);
    delete context[uniqueID];
    return result;
  }
  
```

### 3. bind 
> newFunc = func.bind(thisArg, arg1, arg2, ...)
> bind方法用于创建一个新函数，这个新函数的this指向bind的第一个参数，并且返回这个新函数，参数通过列表传入
> call、apply是立即执行，而bind是返回一个新函数

```js

  Function.prototype.myBind = function(context, ...args){
    const self = this;
    return function(...newArgs){
      return self.apply(context, args.concat(newArgs));
    }
  }

  function sayHi(message){
    console.log(message, 'I am ', this.name);
  }

  const person = {name: 'John'};
  const JohnSayHi = sayHi.myBind(person, 'hello');
  JohnSayHi(); // hello I am John

```