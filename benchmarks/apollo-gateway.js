const { fork } = require('child_process')
const waitPort = require('wait-port')
const { fireGQL } = require('../lib/autocannon')

const query = process.argv[2] || 'large'

const serviceList = [
  { name: 'accounts', port: 4011 },
  { name: 'reviews', port: 4012 },
  { name: 'products', port: 4013 },
  { name: 'inventory', port: 4014 }
]

const forkWait = async (name, file, port) => {
  const child = fork(file, [], { stdio: 'ignore' })
  await waitPort({ host: 'localhost', port, output: 'silent' })
  return child
}

const startGateway = async () => {
  return forkWait('gateway', 'services/apollo-gateway.js', 4000)
}

const startServices = async() => {
  return Promise.all(serviceList.map(async s => {
    return forkWait(s.name, `services/apollo-${s.name}.js`, s.port)
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
  console.log(`🚀 Benchmarking Apollo Federation Gateway - ${query} query (with Apollo Backend)`)

  const services = await startServices()
  const gateway = await startGateway()

  await fireGQL({ url: 'http://localhost:4000', file: `${query}.gql`, track: true })

  stopGateway(gateway)
  stopServices(services)
}

run()

