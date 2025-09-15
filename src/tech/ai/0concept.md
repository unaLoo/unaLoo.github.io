---
title: 0-常见概念
date: 2025-09-07
tags:
  - 前端工程化
---
# Concept 常见概念

## Prompt

==UserPrompt== : 用户直接输出的内容

==SystemPrompt:== 描述 AI 的角色、性格、背景信息，比如 gemini  GEM
![](../../assets/Pasted%20image%2020250907225333.png)
## Agent

如何让 ai 自己去完成任务，而不是单纯的对话？

开源项目 AutoGPT 的思路，以 ai 文件管理助手为例：
- 提前准备一些==文件操作函数代码==，并写好
- 然后注册==功能描述== + ==使用方法==
- autoGPT 基于此生成一套 SystemPrompt，并发给大模型
- 后序用户在对话时，大模型返回==调用某函数的消息==
- autoGPT 基于这个消息去调用函数，并把结果反馈给大模型
- ....

可以看到 autoGPT 就是一个在 user 和 llm 之间传话的东西。

此时，autoGPT 这个传话者就称之为 ==Agent ==(代理人)，“函数 + 描述”就称之为 ==Agent Tool ==
![](../../assets/Pasted%20image%2020250907231626.png)

## Function Calling

虽然我们投喂了 ==函数 + 描述== ，但是 llm 不总是能返回正确的 ==函数调用消息==，有的 agent 针对这种问题的解决方案就是 **重试**

针对这个问题，Open AI， Claude，Gemini 等厂商就出手，推出了 `Function Calling` ==统一格式，规范描述== 的标准化。

比如用一个固定格式的 JSON 来描述一个 tool，解决了通过自然语言去约束 ai 造成的不确定性。在这种情况下针对性训练，所谓的==调用函数的消息==就比较准确了。

目前：
Function Calling 很香，但是每个厂商自己定自己的格式，跨模型通用的还不好搞。
System Prompt 和 Function Calling 两种方式都有。

## MCP

[Model Context Protocol](https://modelcontextprotocol.io/introduction)

前面我们说的一直是 Agent 怎么和大模型去交互，有 **function calling** 和 system prompt 两种方案。

Agent 是怎么和 tool 交互的呢？怎么调用 tool 的呢？
在 autoGPT 中，把 tool 和 agent 放在一个进程里，所以方便调用。

很多 tool 都很使用，所以就有这样一种做法，**把实用的 tools 放在一台服务器里**，所有 agent 都可以通过网络来以一种统一的方式交互和调用。这就是 ==MCP==的理念。

MCP 专门用于规范Agent和Tool服务之间的交互。
- agent --> MCP Client
- server with tools --> MCP Server

MCP 规定了 MCP Client 与 MCP Server 之间的==通信格式、通用接口==。目前 MCP Server里一般放着 `Tools` `Resources` `Prompts` 

目前，MCP 的两种通信方式：
- stdio 适用于本机的两个服务
- sse 适用于跨网络的服务

我们可以自己写MCP，传入 tools，让大模型接入本地MCP并调用

## 小结

[Prompt, Agent, MCP 是什么_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1aeLqzUE6L?spm_id_from=333.788.videopod.sections&vd_source=7dfda965018feb3cdc1aeb93dfd7bf41)
![](../../assets/Pasted%20image%2020250907233600.png)
一次基于MCP的对话交互：
- 用户：发送 User Prompt
- Agent ：Get All MCP tools  --> 发给大模型(FnCall) 
- LLM：找到合适的 tool + 返回调用信息(FnCall)
- Agent ：Call MCP tool + 获取返回值，并把返回值交给 LLM
- LLM：润色结果，返回给 Agent
- Agent：把结果展示给用户


## 补充：新的名词们

### 提示词工程

**目标：**
1. 约束行为
2. 减少错误

**方式:** 
- Zero-shot : 直接要求
- Few-shot : 在提示词中举例
- 思维链: 引导 ai 拆解模型，给出中间结果，再一步步计算


### 上下文工程

Agent 帮助我们管理 history，这个历史记录的管理和修改就是上下文工程。

在简单的 1v1 聊天对话场景里还好。但是在接入了MCP的Agent中，这个管理就很重要，比如一次对话，大语言模型结合Agent可能涉及网页检索、文件浏览等等反复的过程，这就需要 Agent 针对这种大量的中间信息要有优秀的管理修改。

#### 几种常见有效的策略：

**1. 记笔记**
让 ai 根据一定规则策略记笔记，**不跑偏**，Transformer 本身对开头和结尾更敏感。

比如：
- 在实施前，先进行==任务分解==
- 写 ==Todo List==
- 严格按照清单执行
- 完成一项就更新笔记 

---

**2.缩短上下文**

- 把老的信息提取出来，精炼总结(比如RAG)，替代掉冗余的老信息...
- 从源头解决，比如 web-browse 只返回网页中的关键信息而不是全部的html文档
- ...

