---
title: 登录校验：双token
date: 2025-09-30
tags:
  - 登录校验
---
# 双 Token 无感刷新 ？

## 背景提要：

- accesstoken：短token，携带着请求 token，时间为 30min
- refreshtoken：长token，在短token过期时携带续期，时间为 7 d

## 接口支持：

- `/login`：携带用户信息请求，响应两个 token
- `/refresh`：携带refreshToken请求，响应 accessToken
- `/api`：其他正常请求

## 流程：

- 首次登录
	- 用户输入账户密码，服务端校验并返回两个token，客户端存储token
	- 携带短 token 进行请求
	- 当请求 401 时，收集请求，并携带长token请求得到新的短 token 和长 token并存储
	- 将收集的请求一并发出，实现无感刷新和登录续期
- 7d 内二次进入网站
	- 当前有 token，则标记状态为已登录
	- 携带短 token 请求，401 ..... 实现无感刷新和登录续期
- 7d 后再次登录
	- 当前有 token，标记为已登录
	- 携带refreshToken请求，返回已过期，清除token，必须重新登录

## 核心实现：

核心：在401时，避免重复调用接口，通过 **锁 + 请求队列**的形式收集请求，并在刷新后重试
```js
// 全局的刷新状态和请求队列
let isRefreshing = false
let refreshSubscribers = []
function addSubscriber(cb){
	refreshSubscribers.push(cb)
}
function onRefreshed(token){
	refreshSubscribers.forEach(cb=>cb(token))
	refreshSubscribers = []
}

axios.interceptors.request.use(
	(config)=>{
		const token = getAccessToken()
		config.headers['Authorization'] = `Bearer ${token}`
		return config
	},
	(err)=>{
		return Promise.reject(err);
	}
)

axios.interceptors.response.use(
	response=> response,
	async (err)=>{
		const { response, config } = error
		if(!response || response.status !== 401){
			// 其他错误，直接跳出
			return Promise.reject(err)
		}

		// 如果不存在 refreshToken，直接跳出，返回登录页
		const refreshToken = getRefreshToken()
		if(!refreshToken){
			isRefreshing = false
			router.push('/login')
			return Promise.reject(err)
		}

		// 如果已经在刷新 
		if (isRefreshing) {
	      return new Promise((resolve) => {
	        // 返回promise，把请求加入请求队列，等执行后resolve出去
	        addSubscriber((newToken) => {
	          config.headers['Authorization'] = `Bearer ${newToken}`
	          resolve(axios(config))
	        })
	      })
	    }

		// 首次 401,开始 refresh
		isRefreshing = true
		try{
			// 刷新得到新的短 token
			const res = await refreshApi()
			const newAccessToken = res.data
			setAccessToken(newAccessToken)
			
			// 先发当前请求，毕竟是第一个 401 的
		    config.headers['Authorization'] = `Bearer ${newAccessToken}`
		    const resultPromise = axios(config)
		
	        // 重发队列中的请求
			onRefreshed(newAccessToken)
			
			isRefreshing = false
			
			return resultPromise // 返回当前请求的 Promise			
		}catch(err){
			// 刷新错误，回到登录
			isRefreshing = false
			router.push('/login')
			return Promise.reject(err)
		}
		return Promise.reject(err);
	}
)
```