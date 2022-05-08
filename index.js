const WebSocket = require('ws')
const dayjs = require('dayjs')

function noop () {}

function heartbeat () {
  console.log('pong')
  this.isAlive = true
}

const wss = new WebSocket.Server({ port: 8081 })

wss.on('connection', function connection (ws) {
  console.log('on connection: ', (new Date).toLocaleString())

  ws.isAlive = true

  ws.componentDidHide = ''

  ws.on('pong', heartbeat)

  ws.on('message', function incoming (message) {

    const time = dayjs()

    console.log('on message:', message, time.format('YYYY-MM-DD HH:mm:ss.SSS'))


    let data = {}
    try {
      data = JSON.parse(message)
    }catch(e) {
    }
    if (data.event === 'componentDidHide') {
      ws.componentDidHideAt = time
    }

    // message pong?
    if (message === 'ping') {
      ws.send('pong')
    }

  })

  ws.on('close', function close () {
    console.log('on close', dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'))
    console.log('ws.componentDidHideAt', ws.componentDidHideAt)
    console.log(`closed after: ${dayjs().diff(ws.componentDidHideAt)}ms`)
  })
})

const interval = setInterval(function ping () {
  wss.clients.forEach(function each (ws) {
    console.log('ws.isAlive', ws.isAlive)
    if (ws.isAlive === false) return ws.terminate()

    ws.isAlive = false
    ws.ping(noop) // real ping
  })
}, 30000)

