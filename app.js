const Koa = require('koa')

const app = new Koa()

app.use(async (ctx) => {
    ctx.body = 'hello koa'
})

app.listen(3001, () => {
    console.log('port 3001 is listening')
})