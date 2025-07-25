---
title: '我是如何利用Jekyll搭建我的个人博客的？（一）'
date: 2024-04-23
tags:
  - Jekyll
  - blog
  - docker
---

> 一次使用 Docker 本地启动 Jekyll 个人博客以及最终利用Github Pages托管的实践过程，记录了依赖安装、SCSS 编译、linu文件写入权限等问题## 背景

我想在本地部署一个 Jekyll 博客模板进行个性化开发，因为不想折腾 Windows 本地环境和 WSL，于是我选择了用 Docker 来运行 Jekyll。

整个过程从零开始，到最后成功在github.io看到博客页面，遇到不少坑，记录一下!

## 历程

### 拉取官方镜像+挂载+启动

我使用的是官方镜像 [`jekyll/jekyll`](https://hub.docker.com/r/jekyll/jekyll)：

```bash
docker pull jekyll/jekyll
```

然后启动容器：

```bash
docker run --rm -v "$PWD:/srv/jekyll" -p 4000:4000 jekyll/jekyll jekyll serve
```

这会将当前目录（你的jecyll博客项目）挂载到容器的 `/srv/jekyll`，并在 4000 端口运行 Jekyll 服务

对的。然后就开始遇到问题了。(lll￢ω￢)

### 遇到问题：4000端口占用，容器启动失败

这个问题还比较ez，搜了一下，下面的命令可以查询4000端口占用情况

```bash
netstat -ano | findstr :4000
```

果然查到有一个进程在用....遂替换4001

### 有界面了，但CSS缺失

打开浏览器发现页面加载很慢且样式全乱，调试发现：

- 项目代码中引用的 CSS 实际是 SCSS 源文件；
- 没有执行构建，导致 `_site/` 目录中没有真正的 CSS 文件输出。

啥情况呢? 首先是看看到底有没有这个文件，
于是我就想到用后台进程运行jekyll服务，再用主进程查看文件系统里这个文件是否存在。

```bash
nohup jekyll serve --host 0. 0. 0. 0 &
```

因为这个命令会在bash的当前路径下创建一个log文件，记录服务日志信息, 但容器内默认用户对挂载目录没有写权限，导致后台进程报错。
是乎就遇到了另一个问题， 没有写入权限，后台运行失败

### 解决权限问题

我直接给项目目录设置了 777 
> 777：是权限的数值表示，用于设置文件或目录的读（read）、写（write）、执行（execute）权限。第一个数字（7）：表示所有者（owner）的权限。第二个数字（7）：表示所属组（group）的权限。第三个数字（7）：表示其他用户（others）的权限。数字 7 表示拥有读（4）、写（2）和执行（1）三种权限，即 rwx。因此，777 表示所有用户（所有者、所属组和其他用户）都拥有读、写和执行权限。

```bash
chmod -R 777 .
```

然后jekyll就能正常写入文件，跑起来了。

### SCSS编译

服务跑起来了，根据浏览器请求的css路径进入文件系统一看，缺失没有这个文件。但是看到了SCSS相关的内容，那就是SCSS没编译呗

```bash
jekyll build
```

不起作用，而且资料显示，`jekyll serve`的时候就会像web项目的`npm run dev`一样，会先编译再启服务, 再次拷打GPT发现，需要先bundle install

> bundle install 是 Ruby 生态系统中 Bundler 工具的一个命令，用于安装和管理项目依赖的 RubyGems（Ruby 的包管理工具）。Bundler 是一个非常重要的工具，它可以帮助开发者轻松管理项目中所需的 gem（Ruby 的包）及其版本。
> gem 是 Ruby 的包管理系统，类似于 JavaScript 生态系统中的 npm。它用于创建、分发和管理 Ruby 的软件包（称为 gem）。

噢~~ 原来是Ruby的依赖没安装，类比一下，这么说npm相当于是bundle+gem了，一看项目目录里确实有个Gemfile，Gemfile.lock

```bash
bundle install
# then
jekyll serve --host 0. 0. 0. 0
```

至此，可以在本地4001端口访问到默认的博客页面， 样式正常

### 🚀 更方便地启动
为了方便启动，我配置了 `docker-compose.yaml` 和 `dockerfile` 文件：

```yaml
######### docker-compose.yaml #############
services:
  jekyll:
    build: .
    ports:
      - "4001:4000"
    volumes:
      - .:/srv/jekyll
    environment:
      JEKYLL_ENV: docker
```

```dockerfile
# Base image
FROM jekyll/jekyll:latest

# Set the working directory
WORKDIR /srv/jekyll

# Copy the current directory contents into the container
COPY . .

# Bundle install !!!
RUN bundle install

# Command to serve the Jekyll site
CMD ["jekyll", "serve", "-H", "0. 0. 0. 0", "-w", "--config", "_config.yml,_config_docker.yml"]
```

启动命令也变得非常简洁：

```bash
docker-compose up
```

## 修改 config和代码的热更新？

### Q：修改了 `_config.yml` 要重启容器吗？

A：不需要重建镜像，也不需要重建容器，只要保存后重启服务即可。

```bash
docker-compose restart
```

## 最终效果

成功访问 `http://localhost:4001`，看到博客页面！

```bash
docker-compose up
# 浏览器访问 localhost:4001
```

## 后续计划

- ✅ 添加个人主页内容
- ✅ 优化博客导航栏结构

## 总结

这次用 Docker 启动 Jekyll 的经历让我对Ruby项目、docker有了更清晰的了解，也踩了不少坑：

- ✅ 权限问题 → chmod 777
- ✅ SCSS 未编译 → jekyll build
- ✅ 依赖未安装 → bundle install
- ✅ 容器快速启动 → docker-compose

---

如果你也想用 Jekyll + Docker 部署自己的博客，希望这篇踩坑记录对你有所帮助！