const { spawn } = require('child_process')
const waitPort = require('wait-port')
const path = require('path')

const serviceList = [
  { name: 'accounts', port: 4001 },
  { name: 'reviews', port: 4002 },
  { name: 'products', port: 4003 },
  { name: 'inventory', port: 4004 }
]

const start = () => {
  const cwd = path.resolve(__dirname)
  const child = spawn('docker-compose', ['up'], { cwd, detached: true, stdio: 'ignore' })
  child.unref()
  return Promise.all(serviceList.map(async s => {
    return waitPort({ host: 'localhost', port: s.port, output: 'silent' }).then(() => {
      return child
    })
  }))
}

const stop = (services) => {
  services.forEach(s => {
    s.kill()
  })
  const cwd = path.resolve(__dirname)
  return spawn('docker-compose', ['stop'], { cwd, stdio: 'ignore' })
}

module.exports = {
  start,
  stop
}
