import { defineConfig } from 'vitepress'
import fs from 'fs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    // build
    srcDir: './src',

    // optimize
    cleanUrls: true,
    ignoreDeadLinks: true,
    markdown: {
        image: {
            lazyLoading: true
        }
    },

    // meta
    lang: 'zh-CN',
    title: "Loop`s Workshop",
    description: "Loop 的个人站点, 分享Web开发实用技术, 实践和生活",
    head: [
        // icon
        ['link', { rel: "icon", href: "/favicon.ico" }],

        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:title', content: 'Loop 的个人站点' }],
        ['meta', { property: 'og:description', content: '学习 | 实践 | 分享' }],
        ['meta', { property: 'og:image', content: 'https://ruanyf-weekly.plantree.me/thumbnail.jpg' }],
        ['meta', { property: 'og:url', content: 'https://ruanyf-weekly.plantree.me/' }],
        // analytics
        ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-HMPZSQWEV1' }],
        [
            'script',
            {},
            `  window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-HMPZSQWEV1');`
        ],
        // ['script', { src: '/analytic.js', defer: '', }],
    ],

    // theme
    appearance: true,
    lastUpdated: true,
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Tech', link: '/tech' },
            { text: 'Algo', link: '/algo' },
            { text: 'Talk', link: '/talk' },
            { text: 'Life', link: '/life' },
        ],
        sidebar: sideBar(),

        socialLinks: [
            { icon: 'github', link: 'https://github.com/unaLoo' },
        ],
        // lastUpdated: {
        //     text: 'Updated at',
        //     formatOptions: {
        //         dateStyle: 'full',
        //         timeStyle: 'medium'
        //     }
        // }
    }
})


function sideBar() {
    const content = fs.readFileSync('./scripts/sidebar.json', 'utf8').toString()
    const tree = JSON.parse(content)

    // 如果未来要做进一步分类，那在这基于tag做就可以

    return tree
}