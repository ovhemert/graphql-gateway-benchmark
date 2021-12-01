'use strict'

const autocannon = require('autocannon')
const fs = require('fs').promises
const path = require('path')

const fireGQL = async ({ name, desc, url, file, query: q, track }) => {
  const fileName = path.resolve(__dirname, '../benchmarks', `${file}.gql`)
  const query = (fileName) ? (await fs.readFile(fileName)).toString() : q
  const body = JSON.stringify({ query })
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
  return instance.then(result => {
    if (!file) { return result }
    const reportFile = path.resolve(__dirname, '../report', `${name}-${file}.json`)
    const report = { ...result, meta: { name, desc, file } }
    return fs.writeFile(reportFile, JSON.stringify(report))
  })
}

module.exports = {
  fireGQL
}