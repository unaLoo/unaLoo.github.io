---
title: 'JavaScript 中的原型与原型链'
date: 2025-05-06
permalink: /posts/jsobj1/
tags:
  - JavaScript
  - 面试题
---

> 为 JavaScript 的面向对象设计与传统类驱动语言（如 Java、C#）有着本质的不同。
> 这种差异不仅塑造了 JS 独特的语法风格和语言特性，更影响了开发者对对象、继承和复用的理解。
> 本文将深入探讨 JavaScript 中的原型与原型链机制，解析其核心特性与常见问题。


----


- JS 是否是面向对象的语言？
- 原型、原型链是什么？
- 原型继承和类继承有什么区别？
- JS 是如何基于原型链实现继承的？

> 遇到这些问题时， 我们常常会感到困惑，因为 JavaScript 的面向对象设计与传统类驱动语言（如 Java、C#）有着本质的不同, 文章从JS的设计哲学、原型与原型链、从ES5的继承理解原型链三个方面进行阐述。


## 目录

- [一、JS 的设计哲学：无类而有序](#一js-的设计哲学无类而有序)
- [二、原型与原型链：JS 的继承基石](#二原型与原型链js-的继承基石)
- [三、从ES5的继承理解原型链](#三从es5的继承理解原型链)


---

## 一、JS 的设计哲学：无类而有序

> 早期(ES6 之前)的 JavaScript 都没有`Class`关键字，只有对象和函数的概念。  
> 相比于 Java,C#, JS 对象为什么可以动态甚至随意地添加属性和方法？

简而言之地说：JavaScript 是**基于对象**而非传统类驱动的面向对象语言

什么是基于对象？为何如此设计？

[博客](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)对 JS 的设计理念进行了详细讲述，这里进行简单概括：

### 📑 JavaScript 的创建史

---

1994 年，`Netscape Navigator`网络浏览器的出现轰动一时，但当时的浏览器功能单一，真就是名义上的**“浏览器”**，不具备交互性。  
因此，迫切需要一种轻量级的脚本语言来增强浏览器的交互能力。

---

当时，面向对象编程（OOP）已经成为一种流行的编程范式，JS 的设计者 Brendan Eich 也受其影响，希望借鉴 OOP 的优点，但又不想让 JS 变得过于复杂。

---

C++ 用 new 关键字创建对象， JS 同样采用 new 关键字基于**构造函数**创造对象。

但抛弃了类的概念后， 两个实例无法共享属性和方法， 变成了两个独立的对象。

```js
function DOG(name) {
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

因此，JS 设计者决定引入**原型** `prototype`来实现对象属性和方法的复用。

```js
function DOG(name) {
  this.name = name;
}

DOG.prototype = { species: '犬科' };

var dogA = new DOG('大毛');
var dogB = new DOG('二毛');

DOG.prototype.species = '猫科';

log(dogA.species); // 猫科
log(dogB.species); // 猫科
```

---

最终，JS 支持封装、继承、多态, ES6 也带来了 Class 关键字，核心机制依然是**原型链**。例如：

```javascript
// 构造函数方式创建对象
function Person(name) {
  this.name = name;
}
Person.prototype.say = function () {
  console.log(this.name);
};
const p1 = new Person('Alice');

// es6
class Person {
  constructor(name) {
    this.name = name;
  }
  say() {
    console.log(this.name);
  }
}
const p2 = new Person('Alice');
```

---

## 二、原型与原型链：JS 的继承基石

### 1. 原型的本质

在面向对象编程中，**继承**是指将特性从父代传递给子代，以便新代码可以重用并基于现有代码的特性进行构建。  
JavaScript 使用原型链机制实现继承，每个对象都有一条链接到另原型对象的内部链。通过`__proto__`或`Object.getPrototypeOf()`访问。  
该原型对象有自己的原型，依此类推，直到原型为 `null` 的对象，`null` 没有原型，是原型链中最后的一环。

```javascript
const arr = [1, 2, 3];
console.log(arr.map); // 继承自Array.prototype 的 map方法

const x = 'hello world';
console.log(x.split(' ')); // 继承自String.prototype 的 split方法
```

### 2. 函数的原型 VS 对象的原型

**函数的原型** 和 **对象的原型** 是原型链机制的核心。  
上文提到，JS 用 new 创建对象时，基于构造函数而不是类，JS 中的函数具有`prototype`属性
直白地说，当采用一个函数创造对象时，就是把该函数的 prototype 属性给挂到对象的**proto**上

---

#### 01. 函数的原型（`Function.prototype` 和 `fn.prototype`）

- 每个函数（包括构造函数）都有一个 `prototype` 属性

- 这个 `prototype` 是一个对象，会被用作由该函数创建的对象的原型。
- 即：

  ```js
  function Person() {}
  let p = new Person();
  console.log(p.__proto__ === Person.prototype); // true
  ```

- **`Function.prototype` 是所有函数的原型对象**

- 所有函数本身（包括你自定义的）都是 `Function` 的实例：

  ```js
  console.log(Person.__proto__ === Function.prototype); // true
  ```

---

#### 02. 对象的原型（`__proto__`）

`Object.getPrototypeOf(person) === person.__proto__ // true`

- **每个对象都有一个隐藏属性 `__proto__`（标准叫 `[[Prototype]]`）**

- 它指向创建该对象的构造函数的 `prototype` 属性：

  ```js
  let obj = {};
  console.log(obj.__proto__ === Object.prototype); // true
  ```

- **原型链查找机制**

- JS 在查找属性或方法时会沿 `__proto__` 一层层往上找，直到 `null` 为止。
- 这构成了**原型链**，例如：

  ```js
  function Person() {
    this.sayhi = function () {
      console.log('hi');
    };
  }

  const p = new Person();

  console.log(p.__proto__ === Person.prototype, p.__proto__); // true {}

  console.log(
    p.__proto__.__proto__ === Object.prototype,
    Person.prototype.__proto__
  ); // true [Object: null prototype] {}

  console.log(
    p.__proto__.__proto__.__proto__ === null,
    Person.prototype.__proto__.__proto__
  ); // true null

  console.log(Person.__proto__ === Function.prototype, Person.__proto__); // true {}

  console.log(
    Person.__proto__.__proto__ === Object.prototype,
    Person.__proto__.__proto__
  ); // true [Object: null prototype] {}

  console.log(
    Person.__proto__.__proto__.__proto__ === null,
    Person.__proto__.__proto__.__proto__
  ); // true null
  ```

- 如果我们简单模拟一下 js 引擎查找对象的属性的过程：

  ```js
  function getProperty(obj, propName) {
    // 在对象本身查找
    if (obj.hasOwnProperty(propName)) {
      return obj[propName];
    } else if (obj.__proto__ !== null) {
      // 如果对象有原型，则在原型上!递归!查找
      return getProperty(obj.__proto__, propName);
    } else {
      // 直到找到Object.prototype，Object.prototype.__proto__为null，返回undefined
      return undefined;
    }
  }
  ```

---

#### 03. 区别与联系

| 对象/函数    | `.prototype` | `.__proto__`               |
| ------------ | ------------ | -------------------------- |
| 普通对象     | 无           | 指向其构造函数的 prototype |
| 函数         | **有**       | 指向 Function.prototype    |
| 构造函数实例 | 无           | 指向构造函数的 prototype   |

---


## 三、从ES5的继承理解原型链

在ES6之前，JS 没有 class 关键字，实现继承的方式经过了几代演变，最终通过寄生组合式继承实现。

---
以下三种继承方式，均以Parent为父类，Child为子类进行举例说明。

```js
  function Parent() {
      this.colors = ['red', 'blue'];
      this.type = 'parent'
  }
  Parent.prototype.sayHi = function () {
      console.log('hi');
  };

```
---

### 1 最早的继承方式：原型链继承

- 原理：让子类的原型对象指向父类的实例。这样，子类实例就能访问到父类原型上的属性和方法。
- 优点：子类实例可以访问父类原型上的方法。
- 缺点：所有子类实例共享父类实例属性（如数组、对象等引用类型）， 创建子类实例时，无法向父类构造函数传参
   
- 说白了，子类永远持有父类的同一个实例，导致父类属性被错误共享。

---

```js
  function Child() { 
      this.name = 'child'
  }
  Child.prototype = new Parent(); // 关键
  Child.prototype.constructor = Child;

  var c1 = new Child();
  var c2 = new Child();
  c1.colors.push('green');
  c1.type = 'parentA'
  console.log(c1.colors, c1.type); // ['red', 'blue', 'green'] parentA
  console.log(c2.colors, c2.type); // ['red', 'blue', 'green'] parent  // 问题：引用类型被错误共享
  c1.sayHi(); // hi

```

### 2 借用构造函数继承

这种方式的初衷在于解决原型链继承的引用类型被错误共享的问题，通过在子类构造函数中调用父类构造函数来实现。

- 原理：在子类构造函数中调用父类构造函数，这样每个子类实例都有自己的父类实例属性，互不干扰。
- 优点：每个子类实例都有自己的父类属性，互不影响。可以向父类构造函数传参。
- 缺点：父类原型上的方法无法被子类继承（如 sayHi）。每个实例都单独拷贝一份父类属性，方法无法复用。

---

```js
  function Child(){
      Parent.call(this) // 关键
      this.name = 'child'
  }
  var c1 = new Child();
  var c2 = new Child();
  c1.colors.push('green');
  c1.type = 'parentA'
  console.log(c1.colors, c1.type); // ['red', 'blue', 'green'] parentA
  console.log(c2.colors, c2.type); // ['red', 'blue'] parent 
  c1.sayHi(); // 属性没问题了, 但是方法没了，因为没有原型Parent.prototype
```


### 3 最完美的继承方式：寄生组合式继承

这种继承方式结合了前两种方式的优点，既解决了引用类型被错误共享的问题，又解决了无法向父类构造函数传参的问题。

原理：用构造函数继承父类属性，用原型链继承父类方法。
优点：每个子类实例有自己的父类属性，互不影响 | 可以向父类构造函数传参 | 父类原型上的方法可以复用

---

```js
function Child(){
    Parent.call(this) // 关键 1 
    this.name = 'child'
}
Child.prototype = new Parent() // 关键 2
Child.prototype.constructor = Child // 修复构造函数指向, 否则会指向Parent
var c1 = new Child()
var c2 = new Child()
c1.colors.push('green');
c1.type = 'parentA'
console.log(c1.colors, c1.type); // ['red', 'blue', 'green'] parentA
console.log(c2.colors, c2.type); // ['red', 'blue'] parent 
c1.sayHi(); // hi
```
