---
title: 'JavsScript中的Object (一)'
date: 2025-05-06
permalink: /posts/jsobj1/
tags:
  - JavaScript
  - 面试题
---
> 为JavaScript的面向对象设计与传统类驱动语言（如Java、C#）有着本质的不同。
> 这种差异不仅塑造了JS独特的语法风格和语言特性，更影响了开发者对对象、继承和复用的理解。
> 本文将深入探讨JavaScript中的Object，解析其核心特性与常见问题。



----



- JS是否是面向对象的语言？
- 原型、原型链是什么？原型继承和类继承有什么区别？
- Object有哪些常用方法？
- Object的有哪些常用方法？如何判断Object是否为空？
- 如何遍历对象？Reflect.ownKeys()和Object.keys()有什么区别？
- 
> 遇到这些问题时， 我们常常会感到困惑，因为JavaScript的面向对象设计与传统类驱动语言（如Java、C#）有着本质的不同。
> 这种差异不仅塑造了JS独特的语法风格和语言特性，更影响了开发者对对象、继承和复用的理解。
> 本文将深入探讨JavaScript中的Object，解析其核心特性与常见问题。

---

## 一、JS的设计哲学：无类而有序

> 早期(ES6之前)的JavaScript都没有`Class`关键字，只有对象和函数的概念。  
> 相比于Java,C#, JS对象为什么可以动态甚至随意地添加属性和方法？

  

简而言之地说：JavaScript是**基于对象**而非传统类驱动的面向对象语言   
什么是基于对象？为何如此设计？  
[博客](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)对JS的设计理念进行了详细讲述，这里进行简单概括：

### 📑 JavaScript 的创建史
---
   
1994年，`Netscape Navigator`网络浏览器的出现轰动一时，但当时的浏览器功能单一，真就是名义上的**“浏览器”**，不具备交互性。   
因此，迫切需要一种轻量级的脚本语言来增强浏览器的交互能力。   

---

当时，面向对象编程（OOP）已经成为一种流行的编程范式，JS的设计者Brendan Eich也受其影响，希望借鉴OOP的优点，但又不想让JS变得过于复杂。

---

C++ 用new关键字创建对象， JS同样采用new关键字基于**构造函数**创造对象。  
  
但抛弃了类的概念后， 两个实例无法共享属性和方法， 变成了两个独立的对象。

```js
　　function DOG(name){
　　　　this.name = name;
　　　　this.species = '犬科';
　　}
　　let dogA = new DOG('大毛');
　　let dogB = new DOG('二毛');
    // 两两独立的对象，无法共享属性和方法， 更改一个对象的属性，另一个对象不会受到影响。

　　dogA.species = '猫科';
    log(dogB.species); // 显示"犬科"，不受dogA的影响
```

---

因此，JS设计者决定引入**原型** `prototype`来实现对象属性和方法的复用。
```js
　　function DOG(name){
　　　　this.name = name;
　　}

　　DOG.prototype = { species : '犬科' };

　　var dogA = new DOG('大毛');
　　var dogB = new DOG('二毛');

　　DOG.prototype.species = '猫科';

　　log(dogA.species); // 猫科
　　log(dogB.species); // 猫科

```
---

最终，JS支持封装、继承、多态, ES6也带来了Class关键字，核心机制依然是**原型链**。例如：  


```javascript

// 构造函数方式创建对象
function Person(name) { this.name = name; }  
Person.prototype.say = function() { console.log(this.name); };
const p1 = new Person("Alice");

// es6 
class Person {  
  constructor(name) { this.name = name; }  
  say() { console.log(this.name); }  
}
const p2 = new Person("Alice");

```

---


## 二、原型与原型链：JS的继承基石

### 1. 原型的本质

在面向对象编程中，**继承**是指将特性从父代传递给子代，以便新代码可以重用并基于现有代码的特性进行构建。      
JavaScript 使用原型链机制实现继承，每个对象都有一条链接到另原型对象的内部链。通过`__proto__`或`Object.getPrototypeOf()`访问。   
该原型对象有自己的原型，依此类推，直到原型为 `null` 的对象，`null` 没有原型，是原型链中最后的一环。   


```javascript
const arr = [1,2,3];  
console.log(arr.map); // 继承自Array.prototype 的 map方法

const x = "hello world"
console.log(x.split(" ")); // 继承自String.prototype 的 split方法
```

### 2. 函数的原型 VS 对象的原型

**函数的原型** 和 **对象的原型** 是原型链机制的核心。  
上文提到，JS用new创建对象时，基于构造函数而不是类，JS中的函数具有`prototype`属性
直白地说，当采用一个函数创造对象时，就是把该函数的prototype给挂到对象的__proto__上

---

#### 01. 函数的原型（`Function.prototype` 和 `fn.prototype`）

1. 每个函数（包括构造函数）都有一个 `prototype` 属性

   * 这个 `prototype` 是一个对象，会被用作由该函数创建的对象的原型。
   * 即：

     ```js
     function Person() {}
     let p = new Person();
     console.log(p.__proto__ === Person.prototype); // true
     ```

2. **`Function.prototype` 是所有函数的原型对象**

   * 所有函数本身（包括你自定义的）都是 `Function` 的实例：

     ```js
     console.log(Person.__proto__ === Function.prototype); // true
     ```

---

#### 02. 对象的原型（`__proto__`）


`Object.getPrototypeOf(person) === person.__proto__ // true`


1. **每个对象都有一个隐藏属性 `__proto__`（标准叫 `[[Prototype]]`）**

   * 它指向创建该对象的构造函数的 `prototype` 属性：

     ```js
     let obj = {};
     console.log(obj.__proto__ === Object.prototype); // true
     ```

2. **原型链查找机制**

   * JS 在查找属性或方法时会沿 `__proto__` 一层层往上找，直到 `null` 为止。
   * 这构成了**原型链**，例如：

     ```js
     // 1
     person.__proto__ === Person.prototype  // true

     // 2
     Person.prototype.__proto__ === Object.prototype  // true

     // 3
     Object.prototype.__proto__ === null  // true
     ```

    * 如果我们简单模拟一下js引擎查找对象的属性的过程：

     ```js
        function getProperty(obj, propName) {
            // 在对象本身查找
            if (obj.hasOwnProperty(propName)) {
                return obj[propName]
            } else if (obj.__proto__ !== null) {
            // 如果对象有原型，则在原型上!递归!查找
                return getProperty(obj.__proto__, propName)
            } else {
            // 直到找到Object.prototype，Object.prototype.__proto__为null，返回undefined
                return undefined
            }
        }
     ```

---

#### 03. 区别与联系

| 对象/函数  | `.prototype` | `.__proto__`          |
| ------ | ------------ | --------------------- |
| 普通对象   | 无           | 指向其构造函数的 prototype    |
| 函数     | **有**            | 指向 Function.prototype |
| 构造函数实例 | 无            | 指向构造函数的 prototype     |

---


## 三、Object的常用方法与属性特性
### 1. 核心操作方法

| 方法                                | 功能                     | 场景                   |
| ----------------------------------- | ----------------------   | -------------------- |
| `Object.keys(obj)`                  | 获取可枚举字符串键数组     | 遍历属性、判断空对象   |
| `Object.values(obj)`                | 获取属性值数组            | 数据处理               |
| `Object.entries(obj)`               | 返回`[key, value]`数组    | Map转换              |
| `Object.assign(target, ...sources)` | 浅拷贝属性                | 合并配置               |
| `Object.create(proto)`              | 创建指定原型的对象         | 原型继承             |


### 2. 属性类型与控制
JS属性分为**数据属性**和**访问器属性**，可通过`Object.defineProperty`配置：  
```javascript
    Object.defineProperty(obj, 'age', {  
    writable: false, // 不可修改  
    configurable: false, // 不可删除  
    enumerable: false, // 不可遍历  
    value: 25  
    });  
```
判断空对象：  
```javascript
// function isEmpty(obj) {  
//   return Object.keys(obj).length === 0; // 依赖  
// }  

function isEmpty(obj) {  
    return Reflect.ownKeys(obj).length === 0;
}
```

---

> 参考资料：
> [彻底搞懂JS原型与原型链](https://segmentfault.com/a/1190000042725370)      
> [MDN-继承与原型链](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)