---
title: 'Vue3 为什么用Proxy重构'
date: 2025-06-27
tags:
  - 前端框架

---

> Vue3 为什么用Proxy重构

## 1. Proxy

### 1. 1 Proxy 的颠覆性

Object.defineProperty 是对象的属性劫持，只能劫持对象的属性。
Proxy 是对象的代理，可以代理对象的属性、方法、甚至整个对象，这不是一个level的。

Proxy的handle里提供了一堆拦截方法(trap)，可以拦截对象的所有操作。
| 方法 | 描述 |
| --- | --- |
| get | 拦截对象的属性读取 |
| set | 拦截对象的属性设置 |
| has | 拦截对象的in操作符 |
| deleteProperty | 拦截对象的delete操作符 |
| apply | 拦截对象的函数调用 |
| construct | 拦截对象的new操作符 |


Proxy可以做校验器、可以做私有属性...


### 1. 2 vue3 为什么用proxy重构

> Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象
如果对象新增了属性？如果我是一个10000长度的数组？

vue2 的响应式依赖于`Object.defineProperty`
```js
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // ...

      // 收集依赖
      dep.depend()
   
      return value
    },
    set: function reactiveSetter (newVal) {
      // ...

      // 通知视图更新
      dep.notify()
    }
  })
```

在组件初始化时的`initState`中，其中会遍历data中的所有属性，并调用`Object.defineProperty`来劫持这些属性。
    
当在运行时新增属性的话，observer 无法监听到。

对于对象，在vue2中，通过$set来新增属性。

```js
this.$set(target, propertyName/index, value)
```

对于数组，当然你可以遍历数组，给每个元素都设置响应式，但这样性能太差了，vue2也没这么做。

vue2采用的解决方案是：**hack数组的7个方法**, 调用基本方法之后，新增监听以及通知更新
`push` | `pop` | `shift` | `unshift` | `splice` | `sort` | `reverse`

```js
  const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ]

  methodsToPatch.forEach(function (method) {
    const original = arrayProto[method]
    // def <==> Object.defineProperty
    def(arrayMethods, method, function mutator (...args) {
      const result = original.apply(this, args) // 调用原生方法

      const ob = this.__ob__  // ob就是observe实例observe才能响应式
      let inserted
      switch (method) {
        // push和unshift方法会增加数组的索引，但是新增的索引位需要手动observe的
        case 'push':
        case 'unshift':
          inserted = args
          break
        // 同理，splice的第三个参数，为新增的值，也需要手动observe
        case 'splice':
          inserted = args.slice(2)
          break
      }
      // 其余的方法都是在原有的索引上更新，初始化的时候已经observe过了
      if (inserted) ob.observeArray(inserted)
      // dep通知所有的订阅者触发回调
      ob.dep.notify()
      return result
    })
  })
```

    
TS是在 JavaScript 上增加一套静态类型系统（**编译时(开发时)**进行类型分析）
    
在JS的基本类型和引用类型上，增加了一套类型系统
- JS的基本类型+引用类型 `number | string | boolean | null | undefined | object | symbol`
- enum 类型 `enum LogLevel { info = 'info', warn = 'warn', error = 'error' }`
- tuple 类型 `[string, number]`
- any 类型 `any`
- unknown 类型 `unknown`
- never 类型 `never`
- void 类型 `void`
   
- interface 类型 `interface Person { name: string, age: number }`
- 箭头函数 `(a: string) => string`
- 函数 `function(a: string): string`
- 泛型 `T extends object`

- 交叉类型 `A & B` 对象属性多合一
- 联合类型 `A | B` 类型多合一
- 类型断言 `a as string`




## 参考资料
- [vue3-one-piece](https://vue3js.cn/){target="_blank" rel="noreferrer"}