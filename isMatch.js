function isQuadMatch (quad, subject, predicate, object, graph) {
  if (!isTermMatch(quad.subject, subject)) {
    return false
  }

  if (!isTermMatch(quad.predicate, predicate)) {
    return false
  }

  if (!isTermMatch(quad.object, object)) {
    return false
  }

  if (!isTermMatch(quad.graph, graph)) {
    return false
  }

  return true
}

function isTermMatch (term, filter) {
  if (!filter) {
    return true
  }

  if (filter.termType === 'Filter') {
    return filter.test(term)
  }

  if (!term.equals(filter)) {
    return false
  }

  return true
}

module.exports = {
  isQuadMatch,
  isTermMatch
}
