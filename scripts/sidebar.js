import fs from 'fs'
import path from 'path'


/////// Constants //////////////////////////////////
const SRC_DIR = path.join(process.cwd(), 'src')


function pipeRuning(baseArg, ...fns) {
    let res = baseArg
    for (const fn of fns) {
        res = fn(res)
    }
    return res
}

function parseFrontMatterSync(filepath) {

    const content = fs.readFileSync(filepath, 'utf-8')
    const lines = content.split(/\r?\n/)

    let inFrontMatter = false
    const metadata = {
        title: null,
        date: null,
        tags: []
    }

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '---') {
            inFrontMatter = !inFrontMatter;
            if (!inFrontMatter) break; // 读取完 front-matter 后立即退出
            continue;
        }

        if (inFrontMatter) {
            if (trimmed.startsWith('title:')) {
                metadata.title = trimmed.slice(6).trim().replace(/^["']|["']$/g, '');
            } else if (trimmed.startsWith('date:')) {
                metadata.date = trimmed.slice(5).trim();
            } else if (trimmed.startsWith('tags:')) {
                metadata.tags = [];
            } else if (trimmed.startsWith('- ')) {
                metadata.tags.push(trimmed.slice(2).trim());
            }
        }

    }

    return metadata
}

function generateSidebarWithDirStructure(dir) {

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const barItems = []

    // 针对文件夹，文件夹的日期取决于里面md的最早时间
    const getDatefromItems = (items) => {
        let earlier = new Date(Date.now())
        items.forEach(item => {
            if (item.date && item.date < earlier) {
                earlier = item.date
            }
        })
        return earlier
    }

    // Process entry
    entries.forEach(entry => {

        if (entry.isDirectory() && entry.name != 'public') {

            const subDirPath = path.join(dir, entry.name)
            const subDirItems = generateSidebarWithDirStructure(subDirPath)
            barItems.push({
                "text": entry.name || "unkonwn",
                "items": subDirItems,
                "date": getDatefromItems(subDirItems),
                "collapsed": false
            })
        }

        else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.includes('index')) {

            const mdFilePath = path.join(dir, entry.name)
            const metadata = parseFrontMatterSync(mdFilePath)
            barItems.push({
                "text": metadata.title || "unkonwn",
                "date": new Date(metadata.date),
                "link": path.basename(entry.name, '.md')
            })
        }
    })

    // Sort with date
    return barItems.sort((a, b) => a.date - b.date)
}

function sidebar2RouterSidebar(srcBarItems) {
    // 拆解sidebar，再加上link
    const routers = ['talk', 'algo', 'life', 'tech']
    const map = new Map()
    srcBarItems.forEach(sb => {
        map.set(sb.text, sb)
    })


    // 树的深度优先搜索 + 回溯，使得每个link完整

    function treeBacktrace(node, currentPath = []) {

        // 递归结束条件：到达根节点了,根节点具有link属性
        if (node.link) {
            node.link = '/' + currentPath.slice().join('/') + '/' + node.link
            return
        }

        // 递归处理items ，中间节点要记得回溯，中间节点具有text属性
        currentPath.push(node.text)
        for (let childNode of node.items) {
            treeBacktrace(childNode, currentPath)
        }
        currentPath.pop() //回溯
    }

    const res = {}
    routers.forEach(r => {
        treeBacktrace(map.get(r), [])
        res[`/${r}/`] = map.get(r)
    })


    return res
}

/////// Test //////////////////////////////////

// console.log(`===== Source Directroy : ${SRC_DIR} `)
// let sidebar = generateSidebarWithDirStructure(SRC_DIR);
// const sidebar = generateCatogorySidebar(path.join(SRC_DIR, 'algo'), 'algo', true);
// let bar = sidebar2RouterSidebar(sidebar)
// const sidebar = generateCatogorySidebar(path.join(SRC_DIR, 'talk'), 'talk', true);
// const sidebar = generateCatogorySidebar(path.join(SRC_DIR, 'life'), 'life', true);
// const sidebar = generateCatogorySidebar(path.join(SRC_DIR, 'tech'), '', true);
// console.log(JSON.stringify(bar, null, 2));


/////// Main //////////////////////////////////
(function () {
    pipeRuning(
        SRC_DIR, // base argument
        generateSidebarWithDirStructure,
        sidebar2RouterSidebar,
        // (res) => console.log(JSON.stringify(res, null, 2))
        (res) => console.log(JSON.stringify(res, null))
    )
})()