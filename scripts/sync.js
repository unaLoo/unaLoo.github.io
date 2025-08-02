// Inorder to sync local image to public/post-assets

import path from 'path'
import fs from 'fs/promises'

/////// Constants //////////////////////////////////
const srcDir = path.resolve(process.cwd(), 'src')
const localImageDir = path.resolve(srcDir, 'post-assets')
const targetDir = path.resolve(srcDir, 'public', 'post-assets')


/////// Main //////////////////////////////////
async function copyFiles(srcDir, desDir) {
    try {
        await Promise.all([
            fs.access(srcDir),
            fs.access(desDir)
        ])
    } catch {
        throw new Error(`dir not found: ${srcDir} or ${desDir}`);
    }

    let items = await fs.readdir(srcDir);

    const movePromises = items.map(async (item) => {
        const srcItemPath = path.join(srcDir, item);
        const destItemPath = path.join(desDir, item);

        try {
            await fs.access(destItemPath);
            console.warn(`${destItemPath} already existed`);
            return;
        } catch {
            // Do nothing
        }

        // rename <--> move
        // await fs.rename(srcItemPath, destItemPath);
        await fs.copyFile(srcItemPath, destItemPath)
        console.log(`move: ${srcItemPath} → ${destItemPath}`);
    });

    await Promise.all(movePromises);
    // await fs.rmdir(srcDir);
}


copyFiles(localImageDir, targetDir)
