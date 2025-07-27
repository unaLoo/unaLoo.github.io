---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Loop`s Workshop"
  text: " 学习 | 实践 | 分享 "
#   tagline: Loop 的个人博客
#   image:
#     src: /round.png
#     alt: Loop's Social Profile
  actions:
    - theme: 'brand'
      text: Tech 博客
      link: /tech
    - theme: 'brand'
      text: Algo 记录
      link: /algo
    - theme: 'brand'
      text: Talk 随记
      link: /talk
    - theme: 'alt'
      text: Life 生活
      link: /life
features:
  - title: 实践
    details: 记录Web开发的基础知识、实践经验与思考。
  - title: 记录
    details: 把学到的、想到的都塞这里，不定期更新。
  - title: 随记
    details: 分享 Loop 的生活琐碎。

---

<script setup>
import Home from '../.vitepress/theme/Home.vue'

</script>

<Home/>