---
title: 'JavaScript Object'
date: 2025-06-05
permalink: /posts/jsobj2/
tags:
  - JavaScript
---

> Object 是 JavaScript 中最重要的对象之一。ES6 之后，JavaScript 对对象的操作能力被大大增强，**Reflect API** 和 **Proxy API** 是最具代表性的特性。本文梳理了 Object 的常用方法与属性特性，并介绍了 Reflect API 和 Proxy API 的用法。

----

## 目录

- [一、Object 的常用方法与属性特性](#一object-的常用方法与属性特性)
- [二、Reflect API 与 Proxy API](#二reflect-api-与-proxy-api)

---

## 一、Object 的常用方法与属性特性

### 0. 内核方法，关于属性、访问

#### 01 Object.defineProperty() 和 Object.defineProperties()

- 精确定义或修改对象的属性（是否可枚举、配置、写入），可用于添加、修改、删除对象的属性。
- 属性描述符(Getter、Setter), vue2 依赖收集

```js
  // 1
  Object.defineProperty(obj, prop, descriptor);

  const obj = {};
  Object.defineProperty(obj, 'key2', {
    enumerable: false, // 不可枚举
    configurable: false, // 不可配置
    writable: false, // 不可写
    value: 'static',
  });

  let bValue = '';
  Object.defineProperty(o, 'b', {
    get() {
      return bValue;
    },
    set(newValue) {
      bValue = newValue;
    },
    enumerable: true,
    configurable: true,
  });

  // 2
  Object.defineProperties(obj, props);

  const obj = {};
  Object.defineProperties(obj, {
    property1: {
      value: true,
      writable: true,
    },
    property2: {
      value: 'Hello',
      writable: false,
    },
  });
```

相关的 API 还有

- `Object.getOwnPropertyDescriptor()` 方法返回指定对象上一个**自有属性**对应的属性描述符, 不包括原型的。
- `Object.getOwnPropertyNames()` 方法返回一个由指定对象的所有**自身属性**的属性名（包括不可枚举属性但不包括 Symbol 值作为名称的属性）组成的数组。
- `Object.getOwnPropertySymbols()` 方法返回一个给定对象**自身**的所有 Symbol 属性的数组。

---

#### 02 Object.create()

- 以一个现有对象作为**原型**，创建一个新对象
- 使用现有的对象作为新创建的对象的 `__proto__`, **继承**现有对象的属性。

- 💯 下面的例子有助于进一步理解 JavaScript 的原型链机制：

  ```js
  const person = {
    isHuman: false,
    sex: 'male',
    prt: function () {
      console.log(
        `My name is ${this.name}. Am I human? ${this.isHuman}, ${this.sex}`
      );
    },
  };

  const a = Object.create(person);
  const b = Object.create(person);

  a.name = 'a';
  a.isHuman = true;
  b.name = 'b';

  console.log(a.__proto__ === b.__proto__, a.__proto__ === person); // true, true, a和b的原型就是person对象
  // a.sex = 'female' // !! 这里相当于是覆盖了原型上的属性， 所以不会影响到b的sex
  a.__proto__.sex = 'bio'; // !! 这里相当于是修改了原型上的属性， 相当于 person.sex = "bio"， 所以 a 和 b 的 sex 都是 bio

  a.prt();
  b.prt();

  const c = Object.create(person); //"My name is undefined. Am I human? false, bio"
  c.prt();
  ```

相关的 API 还有

- `Object.getPrototypeOf()` 方法返回指定对象的原型（内部 `[[Prototype]]` 属性的值）。
- `Object.setPrototypeOf()` 方法设置一个指定的对象的原型（即，内部 `[[Prototype]]` 属性）到另一个对象或 `null`。

---

#### 03 Object.freeze() , Object.isFrozen()

`Object.freeze()` --- 冻结一个对象，使其不能被修改。

- 冻结对象后，无法添加、删除、修改属性，
- 冻结对象后，无法改变已有属性的可枚举性、可配置性、可写性。
- 冻结对象后，**无法修改对象的原型**。
- 修改会直接触发 TypeError

`Object.isFrozen()` --- 判断一个对象是否被冻结。

```js
const obj = {
  prop() {},
  foo: 'bar',
};

const o = Object.freeze(obj);

console.log(o === obj); // true

obj.foo = 'quux'; // TypeError: Cannot assign to read only property 'foo' of object '#<Object>'
obj.a = '123'; // TypeError: Cannot add property a, object is not extensible
delete obj.foo; // TypeError: Cannot delete property 'foo' of #<Object>
```

---

#### 04 Object.seal() 和 Object.isSealed()

`Object.isSealed()` --- 判断一个对象是否被密封。

`Object.seal()` --- 密封一个对象等价于**阻止其扩展**，然后将现有的属性描述符更改为 configurable: false。

- 这会使对象上的**属性集固定**。令对象的所有属性**不可配置**且可以防止它们从数据属性转换成访问器属性。
- 但它不会防止数据属性的值被更改， **value 可修改**
- 尝试删除或者向密封对象添加属性，或者将数据属性和访问器属性互相转换，都会失败  


这里不举例了，注意属性不可增删，属性集固定，每个属性的 value 可更改

---

#### 05 Object.preventExtensions() 和 Object.isExtensible()

如果一个对象可以添加新的属性，则这个对象是可扩展的。

`Object.isExtensible()` --- 判断一个对象是否可扩展。

`Object.preventExtensions()` --- 将对象标记为不再可扩展，这样它将永远不会具有它被标记为不可扩展时持有的属性之外的属性。

- 不可扩展对象的属性仍然可以被删除。
- 尝试向不可扩展对象添加新属性将会失败

---

### 1. 日常开发常用方法， 关于遍历、判断、克隆

#### 01 Object.keys() 、 Object.values() 和 Object.entries()

`Object.keys()` --- 返回一个由一个给定对象的**自身可枚举属性**组成的数组，数组中属性名的排列顺序和正常循环遍历该对象时返回的顺序一致 。
`Object.values()` --- 返回一个给定对象的所有**自身可枚举属性**值的数组，值的顺序与使用 for...in 循环的顺序相同 ( 区别在于 **for-in 循环枚举原型链中的属性** )。
`Object.entries()` --- 返回一个给定对象自身可枚举属性的键值对数组，其排列与使用 for...in 循环遍历该对象时返回的顺序一致（区别在于 for-in 循环也枚举原型链中的属性）。

```js
const obj = { foo: 'bar', baz: 42 };
console.log(Object.keys(obj)); // ["foo", "baz"]
const obj = { foo: 'bar', baz: 42 };
console.log(Object.values(obj)); // ["bar", 42]
const obj = { foo: 'bar', baz: 42 };
console.log(Object.entries(obj)); // [ ["foo", "bar"], ["baz", 42] ]

// 注意：for-in循环会枚举原型链中的属性
const obj = {
  foo: 'bar',
};
const o = Object.create(obj);
o.a = '1';
Object.entries(o).forEach((item) => {
  console.log(item); // ["a", "1"]
});
console.log('=============================');
for (let key in o) {
  console.log([key, o[key]]); // [ 'a', '1' ], [ 'foo', 'bar' ]
}
```

---

#### 02 Object.assign()

`Object.assign()` --- 将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将**返回目标对象**。

```js
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };

const returnedTarget = Object.assign(target, source);

console.log(target); // 预期输出: Object { a: 1, b: 4, c: 5 }
console.log(returnedTarget === target); // true, 引用相同
```

---

## 二、Reflect API 与 Proxy API

- 在 ES6 之后，JavaScript 对对象的操作能力被大大增强，其中最具代表性的就是 **Reflect API** 和 **Proxy API**。
- 这两者为 JS 提供了更清晰、可控的"元编程能力"，也对传统的 `Object` 方法进行了抽象和增强。

### 0 Reflect API：标准化的 Object 操作工具箱

`Reflect` 是一个内置对象，封装了对对象的底层操作（如 `get`、`set`、`defineProperty`）的"函数化"实现。它的目标是：

- 提供**统一**、语义清晰的接口
- 返回布尔值或结果，**不抛异常**
- 与 `Proxy` handler 中的陷阱（trap）方法一一对应 
  - 它们共同提供了一种统一、标准、可拦截 的操作对象行为的方式；
  - Reflect 提供了默认行为；
  - Proxy 可以在 Reflect 的基础上进行拦截和自定义；
  - 两者配合使用可以更清晰地控制对象的行为。

---

核心方法： 基本和Object的方法一一对应， 但返回布尔值或结果， 不抛异常

- `Reflect.has(obj, prop)` --- 判断对象是否具有某个属性
- `Reflect.get(obj, prop)` --- 获取对象的属性值
- `Reflect.set(obj, prop, value)` --- 设置对象的属性值
- `Reflect.defineProperty(obj, prop, descriptor)` --- 定义对象的属性
- `Reflect.deleteProperty(obj, prop)` --- 删除对象的属性
- `Reflect.getOwnPropertyDescriptor(obj, prop)` --- 获取对象的属性描述符
- `Reflect.getPrototypeOf(obj)` --- 获取对象的原型
- `Reflect.setPrototypeOf(obj, proto)` --- 设置对象的原型
- `Reflect.ownKeys(obj)` --- 获取对象的自身属性


#### 示例：用 Reflect 替代传统方法

```js
const obj = { name: 'Alice' };

// 等价于：'name' in obj
console.log(Reflect.has(obj, 'name')); // true
console.log(Reflect.has(obj, 'age'));  // false

// 等价于 obj.name
Reflect.get(obj, 'name'); // "Alice"

// 设置属性
Reflect.set(obj, 'age', 25);

// 删除属性
const obj = { name: 'Alice', age: 20 }
Reflect.deleteProperty(obj, 'age');
console.log(obj); // { name: 'Alice' }

// 定义属性（等价于 Object.defineProperty）
Reflect.defineProperty(obj, 'gender', {
  value: 'female',
  writable: false,
});

// 获取对象的所有属性，包括不可枚举的属性和 Symbol 属性
const obj = { foo: 1 };
obj[Symbol('bar')] = 2;

console.log(Reflect.ownKeys(obj));  // 输出：[ 'foo', Symbol(bar) ]

```

**好处：**

- 不抛错，适合用于通用库封装
- 更好地与 Proxy 联动

---

### 1 Proxy API：对象的"拦截器"

`Proxy` 是用于创建对象的"代理层"，允许你**拦截并自定义对象的基本操作行为**，例如属性访问、赋值、函数调用等。

```js
const user = { name: 'Bob' };

const proxy = new Proxy(user, {
  get(target, prop) {
    console.log(`访问了属性：${prop}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`设置属性 ${prop} 为 ${value}`);
    return Reflect.set(target, prop, value);
  },
});

proxy.name; // 访问了属性：name
proxy.age = 30; // 设置属性 age 为 30
```

---

#### 这里插播一段嗷：

Vue2 用 `Object.defineProperty`， Vue3 用 `Proxy`，主要是历史原因：

##### Vue2 使用 `Object.defineProperty`

- **原理**：通过递归为每个对象属性添加 `getter/setter` 拦截。
- **缺点**：
  - 无法监听**新添加的**属性或**删除属性**
  - 无法拦截**数组**索引或 **length** 的变化
  - **性能**受限于递归遍历
  - 响应式系统不够"完整"

##### Vue3 使用 `Proxy`

- **原理**：拦截整个对象的读写、添加、删除等操作。
- **优点**：
  - 无需递归，性能更优
  - 支持数组、Map、Set 等复杂结构
  - 能监听属性新增/删除
  - 更现代，语义更清晰，配合 `Reflect` 使用更安全

**Vue3 用 Proxy 是为了更强大的响应式能力和更好的性能扩展性，而 Vue2 的 defineProperty 已无法满足现代应用的复杂需求。**

---

### 2 Reflect + Proxy = 更优雅的对象控制

Proxy 通常配合 Reflect 使用。**Reflect 保证语义一致性和原始行为，避免手动操作 target 对象时的不一致性**。  
在使用 `Proxy` 时，**拦截函数（如 `get`、`set`）的四个参数**分别是 `target`、`key`、`value`、`receiver`。

- `target`：被代理的原始对象

  - 是你传给 `new Proxy()` 的那个对象。
  - 你操作的所有属性，最终都反映在这个 `target` 上。

- `key`/`prop`：被访问或设置的属性名

  - 是一个字符串或 Symbol，表示正在访问或修改的属性。

- `value`：仅在 `set` 中，表示赋的新值

  - 是你要赋给属性的新值。

- `receiver`：调用者，即 Proxy 本身或继承者

  - 是这次操作的**上下文对象**，通常是 `proxy` 本身，但在继承或 `super` 场景中尤为重要。

  **典型用途：与 `Reflect.get` 一起用于继承链中保持正确的 `this`**

  ```js
  const parent = {
    _name: 'ProxyUser',
    get name() {
      return this._name;
    },
  };

  const proxy = new Proxy(parent, {
    get(target, key, receiver) {
      return Reflect.get(target, key, receiver); // 保证 this 指向正确
    },
  });

  console.log(proxy.name); // ProxyUser（this 是 proxy）
  ```

✍️ 小结

| **特性** | **Reflect** | **Proxy** |
| :------: | :---------- | :-------- |
| 目的     | 函数化、统一对象操作 | 拦截并自定义对象的行为 |
| 使用方式 | 直接调用静态方法 | 创建代理对象，定义 handler 函数 |
| 常用场景 | 封装、底层反射、配合 Proxy | 数据劫持、权限校验、响应式、Mock |

---
