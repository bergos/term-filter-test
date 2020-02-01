class LogicTermFilter {
  constructor (type, args) {
    this.termType = 'Filter'
    this.type = type
    this.args = args
  }

  test (term) {
    if (this.type === 'AND') {
      return this.args.every(filter => filter.test(term))
    }

    if (this.type === 'OR') {
      return this.args.some(filter => filter.test(term))
    }

    return false
  }
}

class RelationalTermFilter {
  constructor (type, args) {
    this.termType = 'Filter'
    this.type = type
    this.args = args
  }

  test (term) {
    if (this.type === 'EQ') {
      return term.value.localeCompare(this.args.value) === 0
    }

    if (this.type === 'NE') {
      return term.value.localeCompare(this.args.value) !== 0
    }

    if (this.type === 'GT') {
      return term.value.localeCompare(this.args.value) > 0
    }

    if (this.type === 'GTE') {
      return term.value.localeCompare(this.args.value) >= 0
    }

    if (this.type === 'LT') {
      return term.value.localeCompare(this.args.value) < 0
    }

    if (this.type === 'LTE') {
      return term.value.localeCompare(this.args.value) <= 0
    }

    return false
  }
}

module.exports = {
  and: filters => new LogicTermFilter('AND', filters),
  or: filters => new LogicTermFilter('OR', filters),
  eg: value => new RelationalTermFilter('EQ', value),
  ne: value => new RelationalTermFilter('NE', value),
  gt: value => new RelationalTermFilter('GT', value),
  gte: value => new RelationalTermFilter('GTE', value),
  lt: value => new RelationalTermFilter('LT', value),
  lte: value => new RelationalTermFilter('LTE', value)
}
