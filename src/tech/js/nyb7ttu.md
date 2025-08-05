---
title: '正则表达式'
date: 2025-07-02
tags:
  - JavaScript

---

> 正则表达式在字符串搜索、校验、替换场景中应用广泛，本文介绍正则表达式的基本使用、语法规则、常见实例。


## 1. Intro

正则表达式 `regex` `RE` 是使用单个字符串来描述、匹配一系列符合某个句法规则的字符串搜索模式。
    
可用于搜索、替换、提取和验证。

### 1. 1 基本使用

- 创建
  - 直接创建
  - 使用 `new RegExp()` 创建
- 使用
  - 正则表达式对象原型的 `test()` `exec()`
  - 字符串原型的 `match()` `replace()` `search()`还有`split()`

```js
///// 创建
const re1 = /hello/ 
const re2 = new RegExp('at')

///// 使用
// .test() 返回 true 或 false。
console.log(re1. test("hello world")); // true
console.log(re2. test("hello world")); // false

// .exec() 返回匹配信息数组，如果没有匹配到，返回 null。
let match1 = re2. exec("The cat sat on the mat.");
console.log(match1); 
// ["at", index: 5, input: "The cat sat on the mat.", groups: undefined]

// .match 返回匹配详情
const str = "hello js"
console.log(str.match(/js/))
// [ 'js', index: 6, input: 'hello js', groups: undefined ]

// .replace 基于ER替换
const text = "hello world, hello js"
console.log(text.replace(/hello/, 'Good'))// Good world, hello js
console.log(text.replace(/hello/g, 'hi'))// hi world, hi js

// .search 
console.log(text.search(/ld/)) // 9
```

---

### 1. 2 校验用户名

看个例子：`^[a-zA-Z0-9_-]{3,15}$`    
检测用户名只包含字母、数字、下划线和连接字符 -，并设置用户名的长度为 3-15 个字符。  
其中：
  - `^` 表示开始
  - `[a-zA-Z0-9_-]` 表示字母、数字、下划线和连接字符 -
  - `{3,15}` 表示长度为 3-15 个字符
  - `$` 表示结束

```js
const re = /^[a-zA-Z0-9_-]{3,15}$/
console.log(re.test('_abc_123_ABC_')) // true
console.log(re.test('$1243')); // false
console.log(re.test('12345678901234567890123')); //false
```

---

## 2. 基本语法规则


### 2. 1 修饰符 flags/modifiers
使用：跟在模式字符串后面，表示匹配模式。 
- `var re = /pattern/flags;`
- `var re = new RegExp('pattern', 'flags');`
    
常用的有
- `g` 全局匹配
- `i` 忽略大小写
- `m` 多行匹配


### 2. 2 方括号

方括号用于查找某个范围内的字符：

| 表达式 | 含义 |
| --- | --- |
| `[abc]` | 匹配abc任意字符 |
| `[^abc]` | 匹配非abc的任意字符 |
| `[0-9]` | 匹配0-9之间的任意一个字符 |
| `[a-z]` | 匹配a-z之间的任意一个字符 |
| `[A-Z]` | 匹配A-Z之间的任意一个字符 |
| `[a-zA-Z]` | 匹配a-z或A-Z之间的任意一个字符 |

### 2. 3 元字符
   
元字符是指有特殊含义的字符
   
| 字符 | 含义 | 例子
| --- | --- | --- |
| `.` | 匹配单个字符，除了换行和结束符 | `a.b` 匹配 `a1b` `a2b` `a3b` |
| `\w` | 匹配数字、字母及下划线 | `a\w` 匹配 `a1` `a_` `aA` |
| `\W` | 匹配非单词字符 | `a\W` 匹配 `a!` `a@` `a#` `a$` |
| `\d` | 匹配数字 | `a\d` 匹配 `a1` `a2` `a3` |
| `\D` | 查找非数字字符 | `a\D` 匹配 `aB` |
| `\s` | 查找空白字符 | `a\s` 匹配 `a ` `a\t` `a\n` |
| `\S` | 查找非空白字符 | `a\S` 匹配 `aB` `aC` `aD` |
| `\0` | 查找 NULL 字符 | |
| `\n` | 查找换行符 | |
| `\t` | 查找制表符 | |
| `\f` | 查找换页符 | |
| `\r` | 查找回车符 | |
| `\v` | 查找垂直制表符 | |
| `\xxx` | 查找以八进制数 xxx 规定的字符 | |
| `\xdd` | 查找以十六进制数 dd 规定的字符 | |   
| `\uxxxx` | 查找以十六进制数 xxxx 规定的 Unicode 字符 | |

### 2. 4 量词

量词用于指定字符出现的次数。

| 量词 | 含义 | 例子
| --- | --- | --- |
| `n$` | 匹配字符串结尾 | `/t$/` 匹配 "eat" 但不匹配 "eater"。 |
| `^n` | 匹配字符串开头 | |
| `n?` | 匹配0次或1次 | |
| `n+` | 匹配n次或多次 | |
| `n*` | 匹配0次或多次 | |
| `n{x}` | 匹配x次 | |
| `n{x,y}` | 匹配x到y次 | |
| `?=n` | 匹配任何后紧接n的字符串 | `a(?=b)` 匹配 "ab" 但不匹配 "a"。 |



## 3. 常见RE实例

### 3. 1 邮箱地址匹配
    
如：`12345678901@outlook.com`  `loop1000@gmail.com`
    
`/^[a-zA-Z0-9. _%+-]+@[a-zA-Z0-9. -]+\.[a-zA-Z]{2,}$/`
- `^` 表示开始
- `[a-zA-Z0-9. _%+-]` 包含字母a-z和A-Z、数字0-9、点(*[]内的.不是元字符*)、下划线、百分号、加号和减号， 一次或多次
- `@` 字符@
- `[a-zA-Z0-9. -]+` 包含字母a-z和A-Z、数字0-9、点、减号， 一次或多次
- `\.` 转义加点表示点
- `[a-zA-Z]{2,}` 包含至少两个字母
- `$` 表示结束

### 3. 2 手机号匹配 
    
11位数手机号，通常以 1 开头，第二位是 3-9。

`^1[3-9]\d{9}$`
- `^1` 第一个字符是1
- `[3-9]` 第二位是3-9
- `\d{9}$` 后面9位是数字, 字符串结束

### 3. 3 URL匹配

匹配常见的URL
`/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/`

- 以`https://hooks123. com/blog/post/123`为例
- `^(https?:\/\/)?`  开始的协议是`http://`或`https://`,或者URL没写协议 ， 匹配`https://`
- `([a-zA-Z0-9-]+\.)+`  字母数字出现1次或多次  出现. 整体出现1次或多次 , 匹配`hooks123. `
- `[a-zA-Z]{2,}`  字母出现2次或多次 , 匹配`com`
- `(\/\S*)?`  斜杠后面是任意非空字符`\S`, 0次或1次 , 匹配`/blog/post/123`

### 3. 4 验证密码强度

要求：长度8-16位，至少1个小写字母，至少1个大写字母，至少包含1个数字

`/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,16}$/`
- `(?=.*[a-z])` 匹配任何后紧接小写字母的字符串
- `(?=.*[A-Z])` 匹配任何后紧接大写字母的字符串
- `(?=.*\d)` 匹配任何后紧接数字的字符串
- `[a-zA-Z\d]{8,16}` 匹配8-16位字母数字

### 3. 5 将字符串中的空格替换为下划线

思路：
- 采用字符串replace方法实现，采用g实现全局替换；
- `/\s/g` 匹配所有空白字符

```js
const re = /\s/g
const str = "hello world"
console.log(str.replace(re, '_')) // hello_world

```

## 参考资料
- [正则表达式 菜鸟教程](https://www.runoob.com/regexp/regexp-tutorial.html){target="_blank" rel="noreferrer"}
- [正则表达式 MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions){target="_blank" rel="noreferrer"}