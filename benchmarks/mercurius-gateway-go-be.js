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
  const child = fork(file, [], { stdio: 'ignore' })
  await waitPort({ host: 'localhost', port, output: 'silent' })
  return child
}

const startGateway = async () => {
  return forkWait('gateway', 'services/mercurius-gateway-go-be.js', 4000)
}

const waitServices = async() => {
  return Promise.all(serviceList.map(async s => {
    return waitPort({ host: 'localhost', port: s.port, output: 'silent' })
  }))
}

const stopGateway = gateway => {
  gateway.kill()
}

const run = async () => {
  console.log(`🚀 Benchmarking Mercurius Federation Gateway - ${query} query (with Go Backend)`)

  const services = await waitServices()
  const gateway = await startGateway()

  await fireGQL({ url: 'http://localhost:4000/graphql', file: `${query}.gql`, track: true })

  stopGateway(gateway)
}

run()

