import path from 'path'
import { glob } from 'glob'
import { readFile, writeFile, unlink, rename } from 'node:fs/promises';
import { nanoid } from 'nanoid';

/**
 * Because I want make the index.md first in dir
 */
function uuid() {
    const range = 'z'.charCodeAt() - 'j'.charCodeAt()
    const randHead = String.fromCharCode('j'.charCodeAt() + Math.floor(range * Math.random()))
    return randHead + nanoid(6)
}


/**
 *  Fix markdown file
 */
function fixMD(filepath) {

    readFile(filepath)
        .then((data) => {
            const content = data.toString('utf-8')
            // fix 1.xxx
            let result = content.replace(/(\d+)\.(?!\s)/g, (str) => {
                return str + ' '
            })
            // fix image path
            result = result.replace(/\/images\//g, (str) => {
                return '/'
            })
            // remove ----
            result = result.replace(/[\r\n]+----\s+[\r\n]+/, (str) => {
                return ''
            })
            // remove {:style="width: 380px; display: block; margin: 0 auto;"}
            result = result.replace(/{:[^}]+}/g, (str) => {
                return ''
            })
            // remove permalink: /posts/BFC/  permalink: /posts/BFC/
            result = result.replace(/^permalink:.*\r?\n?/m, (str) => {
                return ''
            })

            // writing to file with randomID
            const fileId = path.resolve(path.dirname(filepath), uuid()) + '.md'
            return writeFile(fileId, result)
        })
        .then((_) => {
            // write new file done
            return unlink(filepath)
        })
        .then((_) => {
            // delete old file done
            console.log(filepath + ' fixed! ')
        })
        .catch(e => {
            throw e
        })
}

// const testMD = 'C:\\Users\\19236\\Desktop\\！！！！\\unaLoo.github.io\\src\\test.md'
// fixMD(testMD)

async function globDir(dirPath, excludes, callback) {

    const checkExcludes = (file) => {
        return !!excludes.find((ex) => path.basename(file).includes(ex))
    }

    const files = await glob(`**/*.md`, {
        cwd: dirPath,
        dot: true,
        absolute: true
    })

    files.forEach(file => {
        if (checkExcludes(file)) return
        callback(file)
    })

}



const ROOT_DIR = path.resolve(process.cwd())

console.log('Fixing Markdown File.......')
const srcDir = path.join(ROOT_DIR, 'src')
const exclues = ['index', 'test']
globDir(
    srcDir,
    exclues,
    (f) => {
        fixMD(f)
    })
