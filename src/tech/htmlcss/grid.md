---
title: Grid 布局
date: 2025-07-23
tags:
---
# Grid 布局

Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是**一维布局**。Grid 布局则是将容器划分成"行"和"列"，产生单元格，然后指定"项目所在"的单元格，可以看作是**二维布局**。Grid 布局远比 Flex 布局强大。

## 基本概念

- `container` 容器，设置了网格布局`display:grid` 的就是容器
- `item` 项目，容器的顶层子元素就是项目
- `row` 行
- `column` 列
- `cell` 由行列交叉产生的单元格
- `grid line` 网格线，总比行数和列数多1 

## 容器属性 container

定义在容器元素上的 css 属性

### display

display: grid 

display: inline-grid

### grid-template-columns / rows

- 单位可以是 `px` `%` `rem` `vw`等各种单位 `fr`  `auto` 
- `fr` 是一个特殊的单位，在做一些比例控制时较为方便
- `auto` 默认时最大长度
- 当 item 大小固定，而容器大小不固定，可以用关键字 `auto-fill` 自动填充

- 函数 `repeat`  
- 函数 `minmax(100px, 1fr)` 表示不小于`100px`，不大于`1fr`。

```css
.item{
	grid-template-columns: 100px 33% 1fr;
	grid-template-columns: 1fr 1fr 1fr; # 三等分
	grid-template-columns: 200px 1fr; # 左侧高度固定，右侧自适应
	
	# 未显示设置 min-width max-width 时,下面相同
	grid-template-columns: 20vw auto 200px;
	grid-template-columns: 20vw 1fr 200px;
	
	# repeat 第二个参数可以是一种模式
	grid-template-columns: repeat(3, 33.33%);
	grid-template-columns: repeat(2, 100px 20px 80px);

	# 自动填充
	grid-template-columns: repeat(auto-fill, 100px);
}
```

### grid-gap

- 缩写：`grid-gap: <grid-row-gap> <grid-column-gap>;`


```css
.container {
    grid-row-gap: 20px;
    grid-column-gap: 20px;

	# 等价
	grid-gap: 20px 20px;
}
```

### grid-template-areas

给网格中的区域进行特殊命名，配合 item 的 `grid-area` 使用。

命名要和几行几列匹配

```html
<html>
<head>
    <title>Grid-template-areas</title>
    <style>
        body {
            margin: 0;
        }

        #page {
            display: grid;
            width: 100vw;
            height: 100vh;
            grid-template-rows: 100px 1fr 50px;
            grid-template-columns: 250px 1fr;
            grid-template-areas:
                "head head"
                "nav  main"
                "foot  foot";
        }
        #page>header {
            /* 当前元素所在的区域为 head */
            grid-area: head;
            background-color: hsl(149, 80%, 90%)
        }

        #page>nav {
            grid-area: nav;
            background-color: hsl(149, 80%, 80%)
        }

        #page>main {
            grid-area: main;
            background-color: hsl(149, 80%, 70%)
        }

        #page>footer {
            grid-area: foot;
            background-color: hsl(149, 80%, 50%)
        }
    </style>

</head>

<body>
    <section id="page">
        <header>header</header>
        <nav>nav</nav>
        <main>main</main>
        <footer>footer</footer>
    </section>
</body>
</html>
```

### grid-auto-flow

当我们划分好网格后，item 会自动放置在每一个网格，默认顺序是先行后列。

这是因为 `grid-auto-flow: row`，其默认值是 `row` ，改为 `column` 可先列后行。

还可以是 `row dense` `column dense` 会紧凑填空，但是顺序就不是文档流顺序了，这个太细了不说了。


### justify-items / align-items

items --> 单元格

在 grid 布局中，`justify-items` 设置单元格内容的**水平位置**，`align-items` 设置单元格内容的**垂直位置**，可取以下值：
- start 对其单元格起始边
- end
- center
- stretch

简写： `place-items: <align-items> <justify-items>;` 


###  justify-content / align-content

content --> 整个内容(网格)

在 grid 布局中，`justify-content` 设置**整个网格**在容器内的**水平位置**，`align-content` 设置**整个网格**在容器内的**垂直位置**，可取以下值：

`start | end | center | stretch | space-around | space-between | space-evenly

和 flex 的 `justify-content` 同样理解即可

###  grid-auto-columns / grid-auto-rows

当我们的 item 数多于网格的单元格数时，会创建多余的网格来存放超出的项目，这俩属性就是设置多余网格的宽高的。


## 项目属性 item 

以下属性都是定义在 flex 布局的容器的**顶层子元素**上的。

### grid-column-start / grid-column-end

`grid-row-start / grid-row-end` 同理

网格总是规范均匀的，但是有时候我们希望某个元素跨越多个网格，就可以用这四个属性来指定项目位于哪些单元格。

- 可以直接写行号和列号
- 还可以用 span 关键字

需要注意的就是 start, end 是左闭右开的
```css
# 下面的 someItem 元素占用了第 1 ，2 行
#someItem{
	grid-column-start: 1;
	grid-column-end: 3;
}
```

### grid-column / grid-row

就是上面的缩写, 注意格式即可， 用 `/` 来分隔起始和终止

```css
.item {
  grid-column: <start-line> / <end-line>;
  grid-row: <start-line> / <end-line>;
}
```

```css
.item-1 {
  background: #b03532;
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}
# 等价
.item-1 {
  background: #b03532;
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
}
```

### grid-area 

前面的例子提到过，容器设置 `grid-template-areas`，项目设置 `grid-area` 也可以实现子元素跨多行多列的效果，并且更加语义化。


### xxx-self

在容器中，我们可以通过 `justify-items` `align-items` `place-items` 统一设置所有项目，在单个项目中，我们也可以单独设置项目的 `justify-self` `align-self` `place-self` 这是一模一样滴



## 参考资料

[CSS Grid](https://ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)

[grid-template-areas - CSS：层叠样式表 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/grid-template-areas)