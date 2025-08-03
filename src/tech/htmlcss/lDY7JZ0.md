---
title: 'BFC - 块级格式化上下文'
date: 2025-05-02
tags:
  - HTML&CSS
---
> CSS重要概念，BFC（Block Formatting Context）是一个独立的渲染区域，主要用于控制元素的布局和相互作用。了解BFC的概念和应用场景，可以帮助我们更好地理解CSS布局和解决一些常见的问题。# 块级格式化上下文 (Block Formatting Context)
 
## 1️⃣ 先来点概念
👉️ 块级格式化上下文（BFC）是一个**独立的渲染区域**，是 Web 页面的可视 CSS 渲染的一部分，用于描述元素如何在页面上布局和相互作用。  
   
BFC就是页面中的一个隔离的独立容器，容器里的标签不会影响到外部标签。
垂直方向的距离由margin决定，属于**同一个BFC**的两个相邻的标签**外边距会发生重叠**。 

---

## 2️⃣ 什么条件下创建了 BFC？
- 根元素（`<html>`）
- 浮动元素（`float` 属性值不为 `none`）
- 绝对定位元素（`absolute` 或 `fixed`）
- 行内块元素（`display` 属性值为 `inline-block`）
- display 为 `table-cell`、`table-caption` 的元素
- `overflow: hidden;`、`overflow: auto;`、`overflow: scroll;`

---  

## 3️⃣ BFC 的应用场景
### 1. 清除浮动

“清除浮动”是前端开发中一个经典的问题，尤其是在使用 **CSS 浮动布局** 时经常遇到。

---

#### 什么是浮动（Float）？

`float` 是 CSS 中的一个属性，最初设计用来实现文字环绕图片的图文排版效果。例如：
```html
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>Float 文字环绕示例</title>
        <style>
            .container {
                width: 550px; /* 修改为550px */
                margin: 40px auto;
                font-family: sans-serif;
                line-height: 2. 5;
                background-color: rgb(235, 219, 200);
            }

            img {
                float: left; /* 图片向左浮动 */
                margin: 0 15px 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <img src="/transparent.png" alt="示例图片">
            <p>
                这是一段测试文字。当你看到这段文字的时候，你会发现它自动地围绕在图片的右侧和下方。
                这是因为我们给图片添加了 <code>float: left;</code> 样式。CSS 中的 float 属性最初就是用来实现这种图文混排效果的。
                Float 布局虽然现在被 Flexbox 和 Grid 所取代，但它仍然是前端发展史中非常重要的一部分。
                理解 float 的原理有助于你更好地理解网页布局的发展历程。
            </p>
            
        </div>
    </body>
    </html>
```
这样图片会向左浮动，文字就会环绕在它的右侧和下侧。   
但后来开发者发现，`float` 可以用来做**多列布局**，所以被广泛用于网页布局中（直到 Flexbox 和 Grid 出现后才逐渐减少使用）。

---

#### 浮动带来的问题

使用 `float` 布局时会出现一个问题：**父容器无法包裹住浮动的子元素**。

```css
.container {
    width: 550px;
    font-family: sans-serif;
    line-height: 2. 5;
}

.left {
    float: left;
    width: 100px;
    height: 550px;
    background-color: rgb(167, 255, 178);
}
```
此时 `.container` 的高度没有被撑开，因为子元素都脱离了文档流。

---

#### 需要清除浮动

“清除浮动”就是为了解决上面这个问题：**让父容器能够正确包含浮动的子元素**。

##### 实现方式有很多种，常见的有以下几种：

---

###### 方法一：使用 `clear: both;`

添加一个**空的**块级元素，并设置 `clear: both;` 来“清除”前面的浮动影响

```html
<div class="parent">
  <div class="child" style="float: left;">左侧</div>
  <div class="child" style="float: right;">右侧</div>
  <div style="clear: both;"></div>
</div>
```

或者使用clearfix方法，采用伪元素清除浮动：

```CSS
#container::after {
  content: "";
  display: block;
  clear: both;
}
```

---

###### 方法二：使用 BFC（重点来了）**

> BFC 区域会包含内部所有的浮动元素。所以只要让父容器形成一个 BFC，就能自动包含浮动的子元素。

```CSS
    .container {
        width: 550px;
        font-family: sans-serif;
        line-height: 2. 5;
        /* overflow: hidden; */
        display: inline-block;
    }
```


这样就不用加额外的 `<div style="clear:both">`，也能达到清除浮动的效果。

---

#### 小结

| 操作         | 描述                                        |
| ------------ | ------------------------------------------- |
| 使用 `float` | 让元素左右排列，但会脱离文档流              |
| 出现的问题   | 父容器高度塌陷，不能包裹浮动子元素          |
| 清除浮动     | 解决高度塌陷问题                            |
| 实现方法     | 加 clear 元素、使用 BFC、flex/grid 布局替代 |

---


### 2. 类似的，使用BFC解决外边界塌陷(Margin Collapse)问题

> 当两个相邻的块级元素都有上下 margin 时，它们的外边距会发生重叠,“合并”成一个，这种现象叫做 margin collapse（外边距重叠）

😧 解决该问题的核心思想： BFC 是一个独立的渲染区域，它内部的元素布局不会影响到外部，所以只要让其中一个元素形成 BFC ，它内部的 margin 就不会和外部元素发生重叠。

对于兄弟之间，只需要让其中一个元素形成 BFC，就能避免两兄弟DOM的 margin 重叠。
对于父子之间，只需要让父元素形成 BFC，就能避免孩子DOM的 margin 超出父亲margin之外。

下面的例子同时演示了兄弟之间的 margin 重叠，以及父子之间的 margin 重叠。

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <style>
        .container {
            width: 200px;
            background-color: cadetblue;
        }

        .box {
            background-color: rgb(255, 187, 187);
            text-align: center;
            margin-top: 10px;
            margin-bottom: 30px;
        }

        .bfc {
            overflow: hidden;
        }
    </style>
</head>

<body>
    <div class="container bfc">
        <div class="box">上BOX</div>
        <div class="bfc">
            <div class="box">下BOX</div>
        </div>
    </div>
</body>

</html>
```
![上下边距塌陷](../../assets/marginCollapse.png)

## 参考资料
- [MDN - Block formatting context](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context){target="_blank" rel="noreferrer"}
- [MDN - clear](https://developer.mozilla.org/zh-CN/docs/Web/CSS/clear){target="_blank" rel="noreferrer"}
- [掘金 - 文章链接](https://juejin.cn/post/6950082193632788493){target="_blank" rel="noreferrer"}