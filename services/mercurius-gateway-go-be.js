'use strict'

const Fastify = require('fastify')
const mercurius = require('mercurius')

const server = Fastify()

const services = [
  { name: 'accounts', url: 'http://localhost:4001/graphql' },
  { name: 'inventory', url: 'http://localhost:4002/graphql' },
  { name: 'products', url: 'http://localhost:4003/graphql' },
  { name: 'reviews', url: 'http://localhost:4004/graphql' }
]

server.register(mercurius, {
  // graphiql: false,
  gateway: {
    services
  }
})

server.listen(4000).then(url => {
  console.log(`🚀 Server ready at ${url}`);
})
