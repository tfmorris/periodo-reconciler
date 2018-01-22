"use strict";

const TextIndex = require('elasticlunr')
    , { convertToRomanNumerals
      , filterCombiningCharacters
      , stopwords, removeCharacters } = require('./utils')

module.exports = {
  index: docs => {
    const index = TextIndex(function() {
      this.addField('label')
      this.addField('localizedLabels')
      this.pipeline.reset()
      this.pipeline.add(stopwords(['period', 'age']))
      this.pipeline.add(filterCombiningCharacters)
      this.pipeline.add(convertToRomanNumerals)
      this.pipeline.add(removeCharacters(['.']))
    })
    docs.forEach(doc => index.addDoc(doc))

    return { search: query => index.search(query,
      { fields:
        { label: {boost: 2}
        , localizedLabels: {boost: 1}
        }
      , bool: 'OR'
      })
    }
  }
}
