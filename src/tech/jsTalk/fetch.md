---
title: Fetch API
date: 2025-09-26
tags:
  - JavaScript
layout:
---
# Fetch API

fetch api 是 XMLHttpRequest 的升级版

## 基本使用

与 XHR 相比，fetch有几大特点：
- Promise  yes!   回调函数 no!
- 模块化设计，API分散在 Request 对象、Response 对象、Header对象等
- 通过数据流 Stream 处理数据，可以分块读取

```js
// 链式调用风格
fetch(url)
	.then((res) => res.text()) 
	.then((res) => console.log("OK!!", res))
	.catch((e) => console.log('Err!!', e)) 

// await 同步风格
async function getJSON() {
  try {
    let response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log('Request Failed', error);
  }
}
```

## Response 对象

`fetch` 方法的返回值是 `Promise<Response>`，Response 对象对应服务器的HTTP回应。

### 属性
Response 本身有一些请求头信息，也可进一步通过流式异步读取数据，具体的标头信息包括：
- ok
- status -- http 状态码
- statusText -- 200 OK 的 OK
- url -- 如果发生了重定向，拿到的就是最终 url
- type 
	- basic： 同源请求
	- cors：跨域请求
	- error：网络错误
	- opace：跨域请求中的简单请求
	- opaqueredirect
- redirected -- 返回是否发生过重定向

### 判断请求成功

```javascript
fetch(url)
	//  404, 500 等都是fulfilledPromise, 但res.ok只有 200~299 才是true
	.then((res) => { console.log(res.status, res.ok); return res.text() }) 
	.then((res) => console.log("OK!!", res))
	.catch((e) => console.log('Err!!', e)) 
	// 用户断网、域名无法解析、TCP错误等... 才会报错

const xhr = new XMLHttpRequest()
xhr.open('GET', url + '1')
xhr.onerror = () => {
	// 用户断网、域名无法解析、TCP错误等... 才会报错
	console.log('xhr err!!', xhr.status)
}
xhr.onload = () => {
	// 404, 500 等都是走这里
	console.log('xhr ok !!', xhr.status)
}
xhr.send()
```

### response header

headers 属性中包含了一个Header对象，其中具有所有的响应头消息，以及get set append delete 等方法。

```js
fetch(url)
	.then((res) => {
		// for (let [key, value] of res.headers) {
		//     console.log(`${key} : ${value}`);
		// }
		console.log(res.headers.get('etag'))
	    console.log(res.headers.get('Content-Type'))
		return res.text()
	})
```


### 内容获取

针对不同类型的数据，有多种读取方法
- .text()
- .json()
- .blob()
- .formData()  
	- 主要用在 Service Worker 里面，拦截用户提交的表单，修改某些数据以后，再提交给服务器
- .arrayBuffer()


### clone

Stream 对象只能读取一次，读取完就没了。比如我把 res.json() 解析为 json 之后，我想再看看 .text() 的结果就不行了。

所以还有 clone 方法, 可以把 res.clone() 一份，然后任意解析


### Response Body

`Response.body`属性是 Response 对象暴露出的底层接口，返回一个 ReadableStream 对象，供用户操作。

它可以用来分块读取内容，应用之一就是显示下载的进度。

```javascript
// fetch 实现下载进度
const url = window.location.href + 'test'
const response = await fetch(url);
const reader = response.body.getReader();
const totalLength = response.headers.get('Content-Length')
console.log(totalLength)

let accumulateBytes = 0
while (true) {
	const { done, value } = await reader.read();
	if (done) {
		break;
	}
	// console.log(`Received ${value.length} bytes`)
	accumulateBytes += value.length
	console.log(`Progress :: ${Math.floor(accumulateBytes / totalLength * 100)}%`)
}
```

上面示例中，`response.body.getReader()`方法返回一个遍历器。
`read()`读取
`done`用来判断有没有读完；`value`是一个 arrayBuffer 数组，表示内容块的内容

⛈ 锐评：
- 这东西其实不太实用，一般做下载就是通过浏览器原生下载来做，让文件从服务器经由浏览器直接到用户文件系统里。而不是放在js内存里。实现方式如下：
	- `<a download>`
	- `Content-Disposition: attachment`


## fetch 第二个参数

`fetch(url, option)`

option 的完整示例：
```js
const response = fetch(url, {
  method: "GET",
  headers: {
    "Content-Type": "text/plain;charset=UTF-8"
  },
  body: undefined,
  referrer: "about:client",
  referrerPolicy: "no-referrer-when-downgrade",
  mode: "cors", 
  credentials: "same-origin",
  cache: "default",
  redirect: "follow",
  integrity: "",
  keepalive: false,
  signal: undefined
});
```


### cache 属性

有以下那么几个，可以**覆盖**浏览器的默认行为：

- default：默认值，先在缓存里面寻找匹配的请求。 
- no-store：直接请求远程服务器，并且不更新缓存。 
- reload：直接请求远程服务器，并且更新缓存。 
- no-cache：将服务器资源跟本地缓存进行比较，有新的版本才使用服务器资源，否则使用缓存。
- force-cache：缓存优先，只有不存在缓存的情况下，才请求远程服务器。 
- only-if-cached：只检查缓存，如果缓存里面不存在，将返回504错误。

场景：服务器返回 `Cache-Control: max-age=3600`

- **默认行为（`cache: 'default'`）**：1 小时内直接用缓存，不发请求。
- **使用 `cache: 'reload'`**：即使在 1 小时内，也发请求到服务器，并更新缓存。
- **使用 `cache: 'force-cache'`**：1 小时后（缓存过期），仍然用旧缓存，不发请求。
- **使用 `cache: 'no-store'`**：永远不读/写缓存，每次都拿最新内容。

### credentials 

`credentials`属性指定是否发送 Cookie，这也是覆盖浏览器默认的发送cookie行为

可能的取值如下：

> - `same-origin`：默认值，同源请求时发送 Cookie，跨域请求时不发送。
> - `include`：不管同源请求，还是跨域请求，一律发送 Cookie。
> - `omit`：一律不发送


### signal

可以传入一个 AbortSignal 实例，取消 fetch 请求

```js
// 1. 创建 AbortController 实例
const controller = new AbortController();
const signal = controller.signal;

// 2. 将 signal 传给 fetch
fetch('/api/data', { signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === 'AbortError') {  // !!!!
      console.log('请求已被取消');
    } else {
      console.error('请求失败:', err);
    }
  });

// 3. 在需要时取消请求（比如用户点击“取消”按钮）
setTimeout(() => {
  controller.abort(); // 触发 AbortError
}, 1000);
```
