const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const { resolve } = require('path')
const crypto = require('crypto')

const mimes = {
    css: 'text/css',
    less: 'text/css',
    gif: 'image/gif',
    html: 'text/html',
    ico: 'image/x-icon',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'text/javascript',
    json: 'application/json',
    pdf: 'application/pdf',
    png: 'image/png',
    svg: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tiff: 'image/tiff',
    txt: 'text/plain',
    wav: 'audio/x-wav',
    wma: 'audio/x-ms-wma',
    wmv: 'video/x-ms-wmv',
    xml: 'text/xml',
}

// 获取文件的类型
function parseMime(url) {
    // path.extname获取路径中文件的后缀名
    let extName = path.extname(url)
    extName = extName ? extName.slice(1) : 'unknown'
    return mimes[extName]
}

// 将文件转成传输所需格式
const parseStatic = (dir) => {
    return new Promise((resolve) => {
        resolve(fs.readFileSync(dir), 'binary')
    })
}

// 获取文件信息
const getFileStat = (path) => {
    return new Promise((resolve) => {
        fs.stat(path, (_, stat) => {
            resolve(stat)
        })
    })
}


const app = new Koa()

app.use(async (ctx) => {
    const url = ctx.request.url
    if (url === '/') {
        // 访问根路径返回index.html
        ctx.set('Content-Type', 'text/html')
        ctx.body = await parseStatic('./index.html')
    } else {
        const filePath = path.resolve(__dirname, `.${url}`)
        const fileBuffer = await parseStatic(filePath)

        const ifNoneMatch = ctx.request.header['if-none-match']
        // 生成内容的hash值
        const hash = crypto.createHash('md5')
        hash.update(fileBuffer)
        const etag = `"${hash.digest('hex')}"`
        ctx.set('Cache-Control', 'no-cache')
        ctx.set('Content-Type', parseMime(url))

        // 对比hash值
        if (ifNoneMatch === etag) {
            ctx.status = 304
        } else {
            ctx.set('etag', etag)
            ctx.body = fileBuffer
        }






    }
})

app.listen(9898, () => {
    console.log('start at port 9898')
})


