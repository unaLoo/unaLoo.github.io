---
title: CSS Selector
date: 2025-07-03
tags:
  - CSS
---
# CSS 选择器

## Intro

下面的html 中，最终的header颜色是 ？

```html
<head>
    <style>
        div[data-type="primary"] {
            color: red;
        }
        #parent-div .header {
            color: green
        }
        #header .title {
            color:blue
        }
        .header.active{
            color: yellow;
        }
    </style>
</head>

<body>
    <div id="parent-div">
        <div id="header" class="header active" data-type="primary">
            HEADER
        </div>
    </div>
</body>
```

**分析：**
- `div[data-type="primary"]`, 标签 + 属性选择器 --> 0011
- `#parent-div .header` id + 后代 + 类  --> 0110 (后代选择器是用来组合的不涉及优先级)
- `#header .title` id + 后代 + 类 --> 0110 , 可惜没选中
- `.header.active` --> 0020 两个类


## 总结

### 核心是两个点：
- 优先级的基本规则
- 组合符只是用来连接选择器的，跟优先级无关

### 优先级规则：
- important
- 内联样式
- ID 选择器
- `.class`、`[attr=val]`、`:hover` 类、属性和伪元素
- `div`、`p`、`::before` 标签、伪元素

### 常见组合符回顾

- ` `：后代选择
```css
A B { ... } // 选中 A 元素的任意层级后代 B
```

- `>` ：直接子元素
```css
A > B { ... } // 选中 A 元素的直接子元素 B
```

- `+` ：相邻兄弟
```css
A + B { ... } // 选中紧跟在 `A` 后面的同级兄弟 `B`（只有一个）
```

- `~`：通用兄弟
```css
A ~ B { ... } // 选中和 `A` 同级、在 `A` 后面的所有兄弟 `B`。
```

