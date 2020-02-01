const DatasetCore = require('@rdfjs/dataset/DatasetCore')
const textSearchDataset = require('rdf-dataset-textsearch')
const { isQuadMatch } = require('./isMatch')

class TextSearchDataset {
  constructor (quads, { property }) {
    this.property = property
    this.dataset = textSearchDataset({
      dataset: new DatasetCore(),
      properties: [{
        term: this.property
      }]
    })

    if (quads) {
      for (const quad of quads) {
        this.add(quad)
      }
    }
  }

  add (quad) {
    this.dataset.add(quad)

    return this
  }

  delete (quad) {
    this.dataset.delete(quad)

    return this
  }

  has (quad) {
    return this.dataset.has(quad)
  }

  matchFilter (subject, predicate, object, graph) {
    if (this.isAcceleratedMatchFilter(subject, predicate, object, graph)) {
      return this._acceleratedMatchFilter(subject, predicate, object, graph)
    }

    const result = []

    for (const quad of this.dataset) {
      if (isQuadMatch(quad, subject, predicate, object, graph)) {
        result.push(quad)
      }
    }

    return new DatasetCore(result)
  }

  _acceleratedMatchFilter (subject, predicate, object, graph) {
    const subjects = this.dataset.search(object.args)

    return subjects.reduce((result, subject) => {
      for (const quad of this.dataset.match(subject, this.property)) {
        result.add(quad)
      }

      return result
    }, new DatasetCore())
  }

  isAcceleratedMatchFilter (subject, predicate, object, graph) {
    if (!(predicate && this.property.equals(predicate))) {
      return false
    }

    if (!(object.termType === 'Filter')) {
      return false
    }

    if (object.type !== 'CUSTOM_TEXT_SEARCH') {
      return false
    }

    return true
  }
}

module.exports = TextSearchDataset
