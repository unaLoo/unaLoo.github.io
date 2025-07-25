---
title: '响应式页面设计(基础)'
date: 2025-05-03
tags:
  - HTML&CSS
---
> 一个网页要在多种尺寸的屏幕上正常显示，需要进行响应式网页设计。
> 我们可以根据不同的屏幕尺寸，使用不同的 CSS 样式来调整网页的布局和样式，但工作量会很大。
> 所以需要利用CSS实现响应式设计，自动适应不同的屏幕尺寸。# 响应式网页设计(基础)


**HTML本身就是响应式的**
```html
    <meta name="viewport" content="width=device-width, initial-scale=1. 0">
```



## 1. 容器的响应式

### 🔅 相对单位实现  
   
> 采用相对单位（如 `rem`、`em`、`%`）来实现响应式设计。   
> - rem：相对于根元素的字体大小（`html`）
> - em: 相对于父元素的字体大小
> - %: 相对于父元素的宽度或高度
> - vw: 相对于视口宽度的百分比（1vw = 1% of viewport width）
> - vh: 相对于视口高度的百分比（1vh = 1% of viewport height）
> - vmin: 相对于视口宽度和高度的较小值（1vmin = 1% of viewport's smaller dimension）
> - vmax: 相对于视口宽度和高度的较大值（1vmax = 1% of viewport's larger dimension）

```css
    body {
        font-size: 16px; /* 1rem = 16px */
        line-height: 1. 5; /* 1. 5倍行高 */
        padding: 1rem; /* 16px */
        margin: 0 auto; /* 居中 */
    }
```

---   


### 🔅 媒体查询（Media Query）实现   
```css
    @media (min-width: 320px) and (max-width: 480px) { 
        ...
        }

    @media (min-height: 600px) { 
      body {
        line-height: 1. 4;
      }
    }

    /* 媒体查询第 4 版, 但是可能兼容性不太好 */
    @media (400px <= width <= 700px) {
      body {
        line-height: 1. 4;
      }
    }
```

## 2. 实现布局的响应式

### 🔅 Flex布局的响应式
   
> 核心：
> 1. `flex-wrap: wrap;` 响应式换行
> 2. `flex-basis` 设置元素的主轴初始大小，或直接设置`width`，`height`, 保证元素大小合理   


```css
    .container {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .box {
        width: 500px;
        height: 200px;
        text-align: center;
    }
```


### 🔅 Grid布局的响应式
> 核心：
> 1. `grid-template-columns` 设置列数和列宽时，采用repeat(auto-fill, minmax(500px, 1fr));函数填满父容器
> 2. 结合`media query`，在不同屏幕尺寸下的手动设置


## 3. 字体的响应式

### 采用Rem单位

### 采用Calc()结合Rem/vw/vm





## 参考资料
- [如何实现响应式设计](https://www.bilibili.com/video/BV1UW4y1b7L9/?spm_id_from=333. 337. search-card.all.click&vd_source=7dfda965018feb3cdc1aeb93dfd7bf41){target="_blank" rel="noreferrer"}