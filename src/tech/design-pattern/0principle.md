---
title: 0-设计原则与思想
date: 2025-08-31
tags:
  - JavaScript
---
# 设计原则与思想

## SOLID 

### SRP 单一职责原则

> A class or module should have a single responsibility.

理解：每一个类要有明确的定义、功能，设计粒度小、功能单一的类。避免把代码耦合在一起。

### OCP 开放闭合原则

>software entities (modules, classes, functions, etc.) should be open for extension , but closed for modification.

理解：设计出这样一个模块，当有新需求时，我们直接拓展使用，而不是更改已有代码。比如任务调度器、校验器这种，在有新的规则时，我们可能是新传入一个callback，而不是改原本的代码

### LSP 里式替换原则

>Functions that use pointers of references to base classes must be able to use objects of derived classes without knowing it. 
>
>在已有代码中，子类对象应该能替代父类对象而不会产生问题

理解：这相当于是给面向对象的**多态**特性加了一层约束，指导我们更合理地使用多态。

### ISP-接口隔离原则

> Clients should not be forced to depend upon interfaces that they do not use.

理解：这个规则指导我们对类或模块进行更细粒度地划分。如果部分调用者只需要模块中的部分功能，那我们就需要把模块拆分成粒度更细的多个模块，让调用者只依赖它需要的那个细粒度模块。

### DIP-依赖反转原则

依赖抽象，而不是依赖具体的细节，面向接口编程。

## KISS 

> Keep it Simple and Stupid
- 不要过度优化
- 不要过度使用一些奇怪小众的技巧
- 不要重复造轮子，要善于使用已有工具

## YAGNI

> You Ain\`t Gonna Neet It 
- 不要去设计当前用不到的功能
- 不要去编写当前用不到的代码
- 不要过度设计

## DRY 
> Don\`t Repeat Yourself 

写完代码review的时候想想，是否
- 功能重复？
- 代码执行重复

## 迪米特法则（Law of Demeter，LoD）

AKA 最少知识原则（Least Knowledge Principle）

> 一个对象应该对其他对象保持最少的了解。只和直接朋友交流，不和陌生人打交道。

- **高内聚（High Cohesion）**：  
    相关的功能逻辑被组织在一起，职责清晰，模块内部联系紧密。
- **低耦合（Low Coupling）**：  
    模块之间依赖少，独立性强，易于维护、测试和复用。


### 补充：react 与 vue 的新一代设计哲学

Vue 的 Composition API 和 React Hooks 在设计思想上都体现了 “高内聚、低耦合” 的软件工程原则。它们通过**逻辑组织方式的革新**，解决了传统组件开发中逻辑分散、复用困难的问题。

- 逻辑封装:
- **关注点分离**: 组件就关注组合，单独的函数就只考虑功能实现 
- 组合 > 继承: 把不同的单元组合到一起
- 独立逻辑，适配单元测试

以vue为例:
```js
// counter.js

import { ref, computed, watch } from 'vue'
function useCounter() {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  watch(count, (newVal) => {
    console.log('count changed:', newVal)
  })

  return { count, double, increment }
}
```

```vue
<script setup>
import useCounter from './counter'

// 使用
const { count, double, increment } = useCounter()
</script>
```

以react为例:
```js
// useCounter.js
import { useState, useMemo, useEffect } from 'react';

function useCounter() {
  const [count, setCount] = useState(0);
  const double = useMemo(() => count * 2, [count]);

  const increment = () => setCount(c => c + 1);

  useEffect(() => {
    console.log('count changed:', count);
  }, [count]);

  return { count, double, increment };
}

// CounterComponent.jsx
export default function Counter() {
  const { count, double, increment } = useCounter();
  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

