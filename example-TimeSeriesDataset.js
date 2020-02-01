const filters = require('./filters')
const rdf = require('@rdfjs/data-model')
const namespace = require('@rdfjs/namespace')
// const { quadToNTriples } = require('@rdfjs/to-ntriples')
const TimeSeriesDataset = require('./TimeSeriesDataset')

const ns = {
  dc: namespace('http://purl.org/dc/terms/'),
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#'),
  xsd: namespace('http://www.w3.org/2001/XMLSchema#')
}

const start = new Date('2020-01-01T00:00:00.000Z')
const end = new Date('2020-02-01T00:00:00.000Z')
const step = 24 * 60 * 60 * 1000

function timeSeriesData () {
  const quads = []

  for (let i = start.valueOf(); i < end.valueOf(); i += step) {
    const subject = rdf.namedNode(`http://example.org/subject/${i}`)
    const date = new Date(i)

    quads.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(date.toString())))
    quads.push(rdf.quad(subject, ns.dc.date, rdf.literal(date.toISOString(), ns.xsd.dateTime)))
  }

  return quads
}

const dataset = new TimeSeriesDataset(timeSeriesData())

console.log('matchFilter using predicate and object term which should not be accelerated and should return 1 result')
const filterFirst = rdf.literal(start.toISOString(), ns.xsd.dateTime)
const first = dataset.matchFilter(null, ns.dc.date, filterFirst)
const firstIsAccelerated = dataset.isAcceleratedMatchFilter(null, ns.dc.date, filterFirst)
console.log('result quads: ' + first.size)
console.log('accelerated: ' + firstIsAccelerated)
// console.log(quadToNTriples([...first][0]))

console.log('matchFilter using an and filter with gt and lte which should be accelerated and should return 1 result')
const secondFilter = filters.and([
  filters.gt(rdf.literal(start.toISOString(), ns.xsd.dateTime)),
  filters.lte(rdf.literal((new Date(start.valueOf() + step)).toISOString(), ns.xsd.dateTime))
])
const second = dataset.matchFilter(null, ns.dc.date, secondFilter)
const secondIsAccelerated = dataset.isAcceleratedMatchFilter(null, ns.dc.date, secondFilter)
console.log('result quads: ' + second.size)
console.log('accelerated: ' + secondIsAccelerated)
// console.log(quadToNTriples([...second][0]))

console.log('matchFilter using a gt filter which should be accelerated and should return 20 results')
const greaterFilter = filters.gt(rdf.literal((new Date(start.valueOf() + step * 10.5)).toISOString(), ns.xsd.dateTime))
const greater = dataset.matchFilter(null, ns.dc.date, greaterFilter)
const greaterIsAccelerated = dataset.isAcceleratedMatchFilter(null, ns.dc.date, greaterFilter)
console.log('result quads: ' + greater.size)
console.log('accelerated: ' + greaterIsAccelerated)
