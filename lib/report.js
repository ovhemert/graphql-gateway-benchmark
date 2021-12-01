'use strict'

const Table = require('cli-table3');
const fs = require('fs').promises
const path = require('path')

const report = async () => {
  const reportPath = path.resolve(__dirname, '../report')
  const reportFiles = await fs.readdir(reportPath)
  const data = reportFiles.map(file => require(path.resolve(reportPath, file)))

  
  const table = new Table({ head: ['Benchmark', 'Query', 'Avg Req/Sec', 'Avg Latency'] })
  const rows = data
    .filter(d => d.errors === 0)
    .sort((a, b) => { return b.requests.average - a.requests.average })
    .map(d => {
      return [d.meta.desc, d.meta.file, d.requests.average, d.latency.average]
    })
  rows.forEach(r => table.push(r))
  console.log(table.toString())
}

report()