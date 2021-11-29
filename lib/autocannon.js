'use strict'

const autocannon = require('autocannon')
const fs = require('fs').promises
const path = require('path')

const fireGQL = async ({ url, file, query, track }) => {
  const fileName = path.resolve(__dirname, '../benchmarks', file)
  const q = (fileName) ? (await fs.readFile(fileName)).toString() : query
  const body = JSON.stringify({ query: q })
  const instance = autocannon({
    url,
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json'
    },
  })
  process.once('SIGINT', () => {
    instance.stop()
  })
  if (track) {
    autocannon.track(instance, { renderProgressBar: false })
  }
  return instance
}

module.exports = {
  fireGQL
}