// `npm run demo`: Vite dev server with the fake API from mock-api.js (sign in: demo / demo)
import { createServer } from 'vite'

process.env.PORTAL_DEMO = '1'
const server = await createServer()
await server.listen()
server.printUrls()
