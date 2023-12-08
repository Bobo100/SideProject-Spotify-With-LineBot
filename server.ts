// https://fastify.dev/docs/latest/Reference/TypeScript/
// TypeScript的Fastify使用方法
// 如果使用ESM的方法
// 需要編譯成JS 之後才能夠使用
// 這邊則需要在package.json中加入
// "build": "tsc -p tsconfig.json",
// "start": "node server.js"
// 然後要移除type: "module"，不然會報錯
// 並且tsconfig.json中target要改成es2017
import fastify from 'fastify'

const server = fastify()

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// 啟動後 (啟動方式 先編譯npm run build，然後啟動npm run start)
// 使用curl測試
// curl localhost:8080/ping