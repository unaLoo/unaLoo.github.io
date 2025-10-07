---
title: 上传进度的实现
date: 2025-10-07
tags:
  - 登录校验
---
# 上传进度的实现

## 背景

之前面试被问到手撕文件上传的实现，用 fetch 不知道何从下手，今天回顾一下。

首先，要做文件上传进度，也就是监控文件流传递到服务器的进度，如果说我们做的是分片上传，那么可以用已上传的chunkNum / totalChunkNum 表示进度；但是如果对于单文件的直接上传要做进度监控呢？

主要有以下两种方案
- `xhr.upload.onprogress`.  XMLHttpRequest 原生提供了这样一个事件
- axios的 `onUploadPorgress` 配置，该配置允许传入一个事件回调函数

其实两者同根同源，axios 只是包装了一层

## 实战

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>

<body>
    <input type="file" placeholder="请选择文件">
    <button id="upl">上传</button>
    <div>
        上传进度 <span>0%</span>
    </div>
    <script>
        const fileDom = document.querySelector('input[type="file"]')
        const btnDom = document.querySelector('button#upl')
        const span = document.querySelector('div span')

        const url = window.location.href + 'file'

        btnDom.addEventListener('click', e => {
            console.log(fileDom.files[0])
            if (fileDom.files.length === 0) {
                alert('请选择文件')
                return
            }
            const file = fileDom.files[0]
            uploadFile(file, updateViewWithProgress)
        })


        function updateViewWithProgress(loaded, total) {
            const percentage = Math.round(loaded / total * 100)
            span.textContent = percentage + '%'
        }


        async function uploadFile(file, onProgress) {
            const formData = new FormData()
            formData.append('file', file)

            // XHR OK
            if (0) {
                const xhr = new XMLHttpRequest()
                xhr.open("POST", url)
                xhr.upload.onprogress = (e) => {
                    onProgress(e.loaded, e.total)
                }
                xhr.onload = (e) => {
                    alert('xhr上传成功！')
                }
                xhr.send(formData)
            }

            // AXIOS cdn 引入版
            if (0) {
                axios.post(url, formData, {
                    onUploadProgress: e => {
                        onProgress(e.loaded, e.total)
                    }
                }).then(() => {
                    alert("axios上传成功！")
                })
            }


            // fetch 做不了上传进度, 下面这种写法是从 response 里拿到的可读流，属于下载进度
            if (1) {
                // const response = await fetch(url, {
                //     method: "POST",
                //     body: formData
                // })

                // const total = response.headers.get('content-length')
                // const reader = response.body.getReader()
                // let loaded = 0
                // while (1) {
                //     const { value, done } = await reader.read()
                //     if (done) {
                //         return
                //     }
                //     loaded += value.length
                //     console.log(loaded, total)
                //     onProgress(loaded, total)
                // }
            }

        }



    </script>
</body>
</html>
```

## 为什么 fetch 不能实现请求的进度监控呢？

上面被注释的代码中，可以看到，通过 fetch 方法返回的 response 对象的 body 是一个可读流对象，我们可以拿到一个流式读取的 reader，每次异步的read方法会返回一个类似迭代器的结果，其中value属性是一个arrayBuffer是原始的响应流数据，因此我们就可以计算当前 response 的进度，视为下载进度。

---

在上传时，那request对象是否也有一个 body，能够这样流式读呢？这里也是看了一些帖子、询问了GPT老师，总结如下：
### Fetch API 的设计初衷

> Promise + Stream = 干净、现代的异步模型，主要面向“**响应流**”。

上传部分的设计在早期规范中就明确：

> Fetch focuses on response streaming, not request streaming (yet).

换句话说：

- Fetch 一开始只考虑**下载流式化**；
    
- **上传流式化（request streaming）** 是后来才在标准草案中被提到的（Fetch Upload Streams），但仍然处于实验阶段。


