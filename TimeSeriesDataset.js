const DatasetCore = require('@rdfjs/dataset/DatasetCore')
const namespace = require('@rdfjs/namespace')
const { isQuadMatch } = require('./isMatch')

const ns = {
  dc: namespace('http://purl.org/dc/terms/')
}

class TimeSeriesDataset extends DatasetCore {
  constructor (quads, { property = ns.dc.date } = {}) {
    super()

    this.property = property
    this.timestamps = []
    this.timeQuads = []

    for (const quad of quads) {
      this.add(quad)
    }
  }

  add (quad) {
    super.add(quad)

    if (quad.predicate.equals(this.property)) {
      const timestamp = TimeSeriesDataset.toTimestamp(quad.object)
      const index = this._indexOf(timestamp)

      this.timestamps.splice(Math.floor(index), 0, timestamp)
      this.timeQuads.splice(Math.floor(index), 0, quad)
    }

    return this
  }

  delete (quad) {
    if (quad.predicate.equals(this.property)) {
      const timestamp = TimeSeriesDataset.toTimestamp(quad.object)
      const index = this._indexOf(timestamp)

      if (index !== Math.floor(index)) {
        return this
      }

      this.timestamps.splice(Math.floor(index), 1)
      this.timeQuads.splice(Math.floor(index), 1)
    }

    super.delete(quad)

    return this
  }

  has (quad) {
    if (quad.predicate.equals(this.property)) {
      const timestamp = TimeSeriesDataset.toTimestamp(quad.object)
      const index = this._indexOf(timestamp)

      return index === Math.floor(index)
    }

    return super.has(quad)
  }

  matchFilter (subject, predicate, object, graph) {
    if (this.isAcceleratedMatchFilter(subject, predicate, object, graph)) {
      return this._acceleratedMatchFilter(subject, predicate, object, graph)
    }

    const result = []

    for (const quad of this) {
      if (isQuadMatch(quad, subject, predicate, object, graph)) {
        result.push(quad)
      }
    }

    return new DatasetCore(result)
  }

  _acceleratedMatchFilter (subject, predicate, object, graph) {
    let result = []

    if (object.type === 'AND') {
      let input = this

      object.args.forEach(filter => {
        input = input._acceleratedMatchFilter(subject, predicate, filter, graph)
      })

      return input
    }

    const index = this._indexOf(TimeSeriesDataset.toTimestamp(object.args))

    if (object.type === 'GT') {
      result = this.timeQuads.slice(Math.ceil(index + 0.5))
    }

    if (object.type === 'LTE') {
      result = this.timeQuads.slice(0, Math.ceil(index + 0.5))
    }

    return new TimeSeriesDataset(result, { property: this.property })
  }

  isAcceleratedMatchFilter (subject, predicate, object, graph) {
    if (!(predicate && this.property.equals(predicate))) {
      return false
    }

    if (!(object.termType === 'Filter')) {
      return false
    }

    if (object.type === 'AND') {
      if (object.args.some(arg => arg.type !== 'GT' && arg.type !== 'LTE')) {
        return false
      }
    } else if (object.type !== 'GT' && object.type !== 'LTE') {
      return false
    }

    return true
  }

  _indexOf (value, start = 0, end = this.timeQuads.length) {
    if (this.timestamps.length === 0) {
      return 0.5
    }

    const middle = Math.floor((start + end) / 2)

    if (this.timestamps[middle] === value) {
      return middle
    }

    if (start >= end) {
      return middle + 0.5
    }

    if (this.timestamps[middle] > value) {
      return this._indexOf(value, start, middle - 1)
    }

    return this._indexOf(value, middle + 1, end)
  }

  static toTimestamp (term) {
    return (new Date(term.value)).valueOf()
  }
}

module.exports = TimeSeriesDataset
