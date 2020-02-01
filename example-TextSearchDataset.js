const filters = require('./filters')
const rdf = require('@rdfjs/data-model')
const namespace = require('@rdfjs/namespace')
const TextSearchDataset = require('./TextSearchDataset')

const ns = {
  rdfs: namespace('http://www.w3.org/2000/01/rdf-schema#')
}

const texts = [
  'This method pulls a chunk of data out of the internal buffer and returns it. If there is no chunk available, then it will return null.',
  'When a chunk can be read from the stream, it will emit this event.',
  'This event fires when there will be no more chunks to read.',
  'This event fires if any error occurs. The message describes the error.'
]

function textData () {
  const quads = []

  texts.forEach((text, i) => {
    const subject = rdf.namedNode(`http://example.org/subject/${i}`)

    quads.push(rdf.quad(subject, ns.rdfs.label, rdf.literal(text)))
  })

  return quads
}

const dataset = new TextSearchDataset(textData(), { property: ns.rdfs.label })

function textSearchFilter (text) {
  const test = term => {
    return term.value.toLowerCase().includes(text.toLowerCase())
  }

  return {
    termType: 'Filter',
    type: 'CUSTOM_TEXT_SEARCH',
    args: text,
    test
  }
}

console.log('matchFilter using predicate and text search filter which should be accelerated and should return 4 results')
const filterThisText = textSearchFilter('this')
const thisText = dataset.matchFilter(null, ns.rdfs.label, filterThisText)
const thisTextIsAccelerated = dataset.isAcceleratedMatchFilter(null, ns.rdfs.label, filterThisText)
console.log('result quads: ' + thisText.size)
console.log('accelerated: ' + thisTextIsAccelerated)

console.log('matchFilter using predicate and object gt filter which should not be accelerated and should return 1 result')
const filterThisGt = filters.gt('this')
const thisGt = dataset.matchFilter(null, ns.rdfs.label, filterThisGt)
const thisGtIsAccelerated = dataset.isAcceleratedMatchFilter(null, ns.rdfs.label, filterThisGt)
console.log('result quads: ' + thisGt.size)
console.log('accelerated: ' + thisGtIsAccelerated)
