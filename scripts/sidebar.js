import path, { resolve } from 'path'
import fs from 'fs'
import { glob } from 'glob'
import readline from 'readline'

const ROOT_DIR = path.resolve(process.cwd())
const SRC_DIR = path.join(ROOT_DIR, 'src')


/**
 *  sidebar: [
      {
        text: 'Section Title A',
        items: [
          { text: 'Item A', link: '/item-a' },
          { text: 'Item B', link: '/item-b' },
          ...
        ]
      },
      {
        text: 'Section Title B',
        items: [
          { text: 'Item C', link: '/item-c' },
          { text: 'Item D', link: '/item-d' },
          ...
        ]
      }
    ]
 */
async function parseFrontMatter(filepath) {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = fs.createReadStream(filepath, { encoding: 'utf8' });
            const rl = readline.createInterface({ input: stream });

            let inFrontMatter = false;
            const metadata = {
                title: null,
                date: null,
                tags: [],
            };

            for await (const line of rl) {
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

            rl.close();
            resolve(metadata)
        }
        catch (e) {
            console.error(e)
        }
    })
}

async function md2item(filePath, base = '/') {
    return new Promise(async (resolve, reject) => {
        const meta = await parseFrontMatter(filePath)
        const localLink = path.basename(filePath).split('.')[0]
        resolve({
            text: meta.title,
            link: base + path.basename(localLink),
            date: new Date(meta.date),
            tags: meta.tags
        })
    })
}

async function parseOneCatogory(catogory) {

    const catogoryDir = path.join(SRC_DIR, catogory)
    const files = await glob('**/*.md', {
        cwd: catogoryDir,
        absolute: true
    })
    const linkPrefix = '/' + catogory + '/'

    const promises = []
    for (let i = 0; i < files.length; i++) {
        if (files[i].includes('index')) continue
        promises.push(md2item(files[i], linkPrefix))
    }
    return Promise.all(promises).then(res => {
        res.sort((a, b) => b.date - a.date)
        return res
    })

}

// const testMD = 'C:\\Users\\19236\\Desktop\\！！！！\\unaLoo.github.io\\src\\test.md'
// const catogory = 'tech'


async function genSideBar(catogories, catoLabel) {

    const res = {}
    for (let i = 0; i < catogories.length; i++) {
        const c = catogories[i]
        const items = await parseOneCatogory(c)
        const cato = `/${c}/`
        res[cato] = [{
            text: catoLabel[i],
            items,
        }]
    }

    console.log(JSON.stringify(res))
    return res
}

const catogories = ['talk', 'tech', 'life', 'algo']
const catoLabel = ['Talk', 'Tech', 'Lift', 'Algorithm']
genSideBar(catogories, catoLabel)