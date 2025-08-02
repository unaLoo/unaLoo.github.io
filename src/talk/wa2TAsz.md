---
title: '我是如何利用Jekyll搭建我的个人博客的？（二）'
date: 2024-04-23
tags:
  - Jekyll
  - blog
  - docker
---

> 从[academicpages模板](https://github.com/academicpages/academicpages.github.io)开始，逐步修改，最后完成了一个自定义化的博客## 背景
academicpages模板太academic了, 包含各种lectures/publications，我需要一个更简约的博客，我希望包含自定义的主页内容，而不是用自己的东西硬套模板。

---

## 历程

### 0️⃣ 查看和梳理项目结构
这里可以看看jekyll的官方网站[官方文档](https://jekyllrb.com/docs/structure/)或中文文档[中文文档](https://jekyllcn.com/docs/structure/)，了解项目的目录结构，其实我create from的这个模板比文档里的目录更为复杂，但也还行，大差不差

核心：
 - _config.yml -- 配置文件，存储了博客的基本信息和配置，包括markdown\sass和其他plugin的配置
 - _layouts/ -- 存储了模板HTML，中间会预留一些插槽，供其他文件填充内容
 - _includes/ -- 存储了可以复用的HTML片段，类似可复用组件的概念
 - _posts/ -- 还有_xxx/，存储博客文章，文件名格式为YYYY-MM-DD-title.md
 - _data/ -- 存储一些通用的数据文件，通常是YAML或JSON格式，可以在模板中引用访问
 - _site/ -- jekyll build的结果, 不用动

---

### 1️⃣ 了解Liquid语法
Liquid 是一种**模板语言**，类似于Vue的template引擎，用于在 HTML 文件中插入动态内容。它广泛应用于**Jekyll**，以及许多其他网页模板系统中。

Liquid 的语法非常简洁，主要由以下三种标签类型组成：

#### 🧱 基本语法结构

![liquid.png](/post-assets/liquid.png)
(好家伙在这里用Liquid居然会G，编译不通过)

##### 3. 过滤器（Filters）
![filter.png](/post-assets/i2. png)


#### 🧰 常用内建对象

- `site`：站点全局信息（Jekyll 中常见）
- `page`：当前页面的信息
- `content`：页面内容本身

---




### 2️⃣ 个人信息修改
非常Eazy，填入个人信息就可以套模板，没有的东西不填就好，在模板里会作判断
![_config.yml](/post-assets/selfIntro.png)

### 3️⃣ 导航栏和路由结构修改

#### 修改_config.yml
导航栏和路由相关的内容在_config.yml中有涉及，主要是`collections` 和 `defaults`,这两定义了集合以及不同集合的默认layout、author_profile这些属性。
我删除了publications\teachings\lectures这些集合，保留了blog和talks两个集合并增加了algorithms集合。

```yaml
collections:
  algorithm:
    output: true
    permalink: /:collection/:path/
  posts:
    output: true
    permalink: /:collection/:path/
  talks:
    output: true
    permalink: /:collection/:path/

defaults:
  # _posts
  - scope:
      path: ""
      type: posts
    values:
      layout: talk
      author_profile: true
      share: false
      # read_time: true
      # comments: true
      # related: true

  # _algorithm
  - scope:
      path: ""
      type: algorithm
    values:
      layout: talk
      author_profile: true
      share: false

  # _talks
  - scope:
      path: ""
      type: talks
    values:
      layout: talk
      author_profile: true
      share: false
```


#### 修改_data中的navigation配置
```yaml
main:
  - title: "博客"
    url: /posts/
  
  - title: "算法"
    url: /algorithm/

#### 其他
```
---


### 4️⃣ 添加新路由的文件内容
和_posts/类似的，在根目录下创建_algorithm/，然后在里面粘贴一个测试博客文件，注意文件命名
---

### 5️⃣ 添加layout | 添加page

`layout`是进入你这个新路由时的外壳模板，此处我直接用的archive layout，如果有特殊样式需求，可以在_layouts/中添加一个特定的布局HTML文件。

`page`是进入你这个新路由时的核心内容，大部分时一系列博客条目或者一些博客卡片。需要创建一个新的HTML文件，命名为无所谓，但在这个pageHTML中要包含以下内容, 包含使用的**布局**，**路由**配置以及其他。

```Liquid
---
layout: archive
title: "Algorithm and Data Structure Talks"
author_profile: false
share: false
---
```

在这之后就可以随意写你的Liquid代码了，下面是我写的一个简单的算法博客列表，通过include 调用一个名为 archive-single-talk.html 的组件，来实现一个博客卡片的效果。

卡片的CSS和HTML就不展开说了，都是采用Liquid语法写的dom，其中，因为这个组件是包在post循环里面的，所以组件内部可以访问到`post`这个变量，代表当前循环的post对象，也就可以取信息，做展示了。

![alt text](/post-assets/i1. png)

### 6️⃣ 调试测试
用上文提到的`docker-compose`快速重启，在本地调试，查看效果，可以看到新加的算法目录下能够按指定的layout和page展示出博客列表了。

- 🖐️Tips 1
如果你发现你的博客点开之后，是一个非常耿直全屏朴素的页面，首先你应该先庆祝自己成功了99%，你的md成功被转译为HTML了。
至于为啥没有其他东西了？请检查你的layout以及_config.yml中 scope的类型，这里的scope要和你新建的collection名称一致。



- 🖐️Tips 2
如果你发现你的导航页下面的文章内容展开了，那你可以研究以下配置，尤其是excerpt_separator

```yaml
# Conversion
markdown: kramdown
highlighter: rouge
lsi: false
excerpt_separator: "===="
incremental: false

```


`excerpt_separator` 是 Jekyll 用来“截断文章内容”的标记，表示：

> 从 Markdown 文件中截取开头一部分内容作为摘要（excerpt），其余部分作为正文。

---

✍️ 怎么设置？

在文章中手动添加分隔符 + 在 `_config.yml` 中指定分隔符
Jekyll 才会知道从这里把内容一分为二。


我去，在这里写在markdown里的Liquid也会被编译，我换成截图吧.../(ㄒoㄒ)/~~