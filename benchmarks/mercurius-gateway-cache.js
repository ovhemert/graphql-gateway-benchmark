const { fork } = require('child_process')
const waitPort = require('wait-port')
const { fireGQL } = require('../lib/autocannon')

const query = process.argv[2] || 'large'

const serviceList = [
  { name: 'accounts', port: 4001 },
  { name: 'reviews', port: 4002 },
  { name: 'products', port: 4003 },
  { name: 'inventory', port: 4004 }
]

const forkWait = async (name, file, port) => {
  const child = fork(file, ['cache'], { stdio: 'ignore' })
  await waitPort({ host: 'localhost', port, output: 'silent' })
  return child
}

const startGateway = async () => {
  return forkWait('gateway', 'services/mercurius-gateway.js', 4000)
}

const startServices = async() => {
  return Promise.all(serviceList.map(async s => {
    return forkWait(s.name, `services/mercurius-${s.name}.js`, s.port)
  }))
}

const stopGateway = gateway => {
  gateway.kill()
}

const stopServices = services => {
  services.forEach(s => {
    s.kill()
  })
}


const run = async () => {
  console.log(`🚀 Benchmarking Mercurius Federation Gateway - ${query} query (with cache & Fastify Backend)`)

  const services = await startServices()
  const gateway = await startGateway()

  await fireGQL({ 
    name: 'mercurius-gateway-cache',
    desc: 'Mercurius Gateway to Mercurius Backend services (caching)', 
    url: 'http://localhost:4000/graphql', 
    file: query, 
    track: false 
  })

  stopGateway(gateway)
  stopServices(services)
}

run()

