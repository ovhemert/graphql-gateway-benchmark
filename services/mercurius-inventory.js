'use strict'

const Fastify = require('fastify')
const mercurius = require('mercurius')
const cache = require('mercurius-cache')

const inventory = [
  { upc: "1", inStock: true },
  { upc: "2", inStock: false },
  { upc: "3", inStock: true }
]

const app = Fastify()
const schema = `
  extend type Product @key(fields: "upc") {
    upc: String! @external
    weight: Int @external
    price: Int @external
    inStock: Boolean
    shippingEstimate: Int @requires(fields: "price weight")
  }
`

const resolvers = {
  Product: {
    __resolveReference(object) {
      return {
        ...object,
        ...inventory.find(product => product.upc === object.upc)
      };
    },
    shippingEstimate(object) {
      // free for expensive items
      if (object.price > 1000) return 0;
      // estimate is based on weight
      return object.weight * 0.5;
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  federationMetadata: true
})

app.register(cache, {
  ttl: process.argv.includes('cache') ? 10 : 0,
  all: true
})

app.get('/', async function (req, reply) {
  const query = '{ _service { sdl } }'
  return app.graphql(query)
})

app.listen(4004).then(url => {
  console.log(`🚀 Server ready at ${url}`)
})
