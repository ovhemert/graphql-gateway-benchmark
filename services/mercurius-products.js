'use strict'

const Fastify = require('fastify')
const mercurius = require('mercurius')

const products = [
  {
    upc: "1",
    name: "Table",
    price: 899,
    weight: 100
  },
  {
    upc: "2",
    name: "Couch",
    price: 1299,
    weight: 1000
  },
  {
    upc: "3",
    name: "Chair",
    price: 54,
    weight: 50
  }
]

const app = Fastify()
const schema = `
    extend type Query {
      topProducts(first: Int = 5): [Product]
    }
    type Product @key(fields: "upc") {
      upc: String!
      name: String
      price: Int
      weight: Int
    }
`

const resolvers = {
  Product: {
    __resolveReference(object) {
      return products.find(product => product.upc === object.upc);
    }
  },
  Query: {
    topProducts(_, args) {
      return products.slice(0, args.first);
    }
  }
}

app.register(mercurius, {
  schema,
  resolvers,
  federationMetadata: true
})

app.get('/', async function (req, reply) {
  const query = '{ _service { sdl } }'
  return app.graphql(query)
})

app.listen(4013).then(url => {
  console.log(`🚀 Server ready at ${url}`)
})
