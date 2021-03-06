"use strict";

const test = require('tape')
    , label = require('../src/label')

test('empty queries return zero results', t => {
  const docs = [
    {id: 'rank1', label: 'Bronsålder', localizedLabels: 'Bronze Age'},
    {id: 'rank0', label: 'Bronze Age'}
  ]
  const results = label.index(docs).search('')
  t.plan(1)
  t.same(results, [])
})

test('undefined queries return zero results', t => {
  const docs = [
    {id: 'rank1', label: 'Bronsålder', localizedLabels: 'Bronze Age'},
    {id: 'rank0', label: 'Bronze Age'}
  ]
  const results = label.index(docs).search(undefined)
  t.plan(1)
  t.same(results, [])
})

test('sanity test 1', t => {
  const docs = [
    {id: 'rank1', label: 'Bronsålder', localizedLabels: 'Bronze Age'},
    {id: 'rank0', label: 'Bronze Age'}
  ]
  const results = label.index(docs).search('Bronze Age')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('parts and modifiers must match 1', t => {
  const docs = [
    {id: 'unranked1', label: 'Early Bronze III'},
    {id: 'unranked2', label: 'Early Bronze'},
    {id: 'rank0', label: 'Bronze'}
  ]
  const results = label.index(docs).search('Bronze')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('parts and modifiers must match 2', t => {
  const docs = [
    {id: 'unranked1', label: 'Early Bronze III'},
    {id: 'rank0', label: 'Early Bronze'},
    {id: 'unranked2', label: 'Bronze'},
    {id: 'unranked3', label: 'Early Curly'},
  ]
  const results = label.index(docs).search('Early Bronze')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('sanity test 4', t => {
  const docs = [
    {id: 'rank1', label: 'XXXXXX', localizedLabels: 'Bronze'},
    {id: 'rank0', label: 'Bronze', localizedLabels: 'XXXXXX'}
  ]
  const results = label.index(docs).search('Bronze')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('sanity test 5', t => {
  const docs = [
    {id: 'rank0', label: 'XXXXXX', localizedLabels: 'Bronze'},
    {id: 'rank1', label: 'YYYYYY', localizedLabels: 'Bronze, ZZZZZZ'}
  ]
  const results = label.index(docs).search('Bronze')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('appended temporal range is ignored', t => {
  const docs = [
    {id: 'rank0', label: 'Alexander, 1501-1506'},
    {id: 'rank1', label: 'Alexander'}
  ]
  const results = label.index(docs).search('alexander')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('diacritics', t => {
  const docs = [
    {id: 'rank0', label: 'Förromersk järnålder'}
  ]
  const results = label.index(docs).search('forromersk jarnalder')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('greek', t => {
  const docs = [
    {id: 'rank0', label: 'Ύστερη Εποχή του Χαλκού'},
    {id: 'unranked', label: 'XXXXXX'}
  ]
  const results = label.index(docs).search('Εποχή')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('cyrillic', t => {
  const docs = [
    {id: 'rank0', label: 'Пізньоантичний період'},
    {id: 'unranked', label: 'XXXXXX'}
  ]
  const results = label.index(docs).search('період')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('chinese', t => {
  const docs = [
    {id: 'unranked', label: 'XXXXXX'},
    {id: 'rank0', label: 'Northern Song', localizedLabels: '北宋'}
  ]
  const results = label.index(docs).search('北宋')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('weird LCSH syntax', t => {
  const docs = [
    {id: 'rank1', label: '18th Century::2nd/3rd quarter (1725 - 1774)'},
    {id: 'rank0', label: '18th Century'}
  ]
  const results = label.index(docs).search('18th century')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('should match with special modifier/suffix tokenizing', t=> {
  const docs = [
    {id: 'unranked1', label: 'Late Helladic'},
    {id: 'unranked2', label: 'Late Cycladic'},
    {id: 'rank0', label: 'Late Helladic IIIA'},
    {id: 'unranked3', label: 'Early Cycladic'},
  ]
  const results = label.index(docs).search('Late Helladic IIIA')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('should ignore `period`', t=> {
  const docs = [
    {id: 'rank0', label: 'Late Helladic'},
    {id: 'unranked1', label: 'Late Cycladic'},
    {id: 'unranked2', label: 'Cycladic Period'},
  ]
  const results = label.index(docs).search('Late Helladic Period')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('should ignore `age`', t=> {
  const docs = [
    {id: 'unranked1', label: 'Iron Age'},
    {id: 'unranked2', label: 'Bronze Age'},
    {id: 'rank0', label: 'Late Bronze'},
  ]
  const results = label.index(docs).search('Late Bronze Age')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('should search decomposed unicode with combining characters removed', t => {
  const docs = [
    {id: 'rank0', label: 'Dông Son'},
  ]
  const results = label.index(docs).search('Dong Son')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('should understand Roman numerals as equivalent to Arabic numerals', t => {
  const docs = [
    {id: 'rank2', label: 'Iron Age II'},
    {id: 'rank1', label: 'Bronze Age III'},
    {id: 'rank0', label: 'Bronze Age II'},
  ]
  const results = label.index(docs).search('Bronze Age 2')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1', 'rank2'])
})

test('should ignore BC', t => {
  const docs = [
    {id: 'unranked', label: '1200 BC Middle East'},
    {id: 'rank0', label: 'Athenian supremacy, 479-431 B.C'},
  ]
  const results = label.index(docs).search('Athenian supremacy, 479-431 B.C.')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('identical labels should match', t => {
  const docs = [
    {id: 'exactmatch', label: 'Bourbons, 1700-'},
  ]
  const results = label.index(docs).search('Bourbons, 1700-')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['exactmatch'])
})

test('identical alternate labels should match', t => {
  const docs = [
    {id: 'exactmatch', label: 'Li Zicheng Rebellion, 1628-1645',
     localizedLabels: "Li Tzu ch'eng Rebellion, 1628-1645"},
  ]
  const results = label.index(docs).search("Li Tzu ch'eng Rebellion, 1628-1645")
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['exactmatch'])
})

test('strings of two or more digits in labels should be ignored', t => {
  const docs = [
    {id: 'unranked2', label: 'Civil War 1861-1865'},
    {id: 'unranked1', label: 'Civil War (1861 - 1865)'},
    {id: 'unranked0', label: 'Xianfeng, 1850-1861'},
    {id: 'rank1', label: 'Abdul Mejid, 1839-1861'},
    {id: 'rank0', label: 'Abdul Aziz, 1861-1876'},
  ]
  const results = label.index(docs).search('Abdul Aziz, 1861-1876')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('"war" is not a separate token', t => {
  const docs = [
    {id: 'rank0', label: 'Civil War (1861 - 1865)'},
    {id: 'rank1', label: 'Civil War 1861-1865'},
    {id: 'unranked0', label: 'Xianfeng, 1850-1861'},
    {id: 'unranked1', label: 'Some Other War, 1839-1861'},
    {id: 'unranked2', label: 'Civil Wars'},
  ]
  const results = label.index(docs).search('Civil War 1861-1865')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0', 'rank1'])
})

test('"wars" is not a separate token', t => {
  const docs = [
    {id: 'unranked0', label: 'Civil War (1861 - 1865)'},
    {id: 'unranked1', label: 'Civil War 1861-1865'},
    {id: 'unranked2', label: 'Xianfeng, 1850-1861'},
    {id: 'unranked3', label: 'Some Other War, 1839-1861'},
    {id: 'rank0', label: 'Civil Wars'},
  ]
  const results = label.index(docs).search('Civil Wars')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('"of" is a stopword', t => {
  const docs = [
    {id: 'unranked', label: 'Revolt of Sertorius'},
    {id: 'rank0', label: 'Age of Tyrants'},
  ]
  const results = label.index(docs).search('Age of Tyrants')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})

test('hyphenated and unhyphenated versions of modifiers should match', t => {
  const docs = [
    {id: 'unranked1', label: 'Babylonian'},
    {id: 'unranked2', label: 'Neo'},
    {id: 'rank0', label: 'Neo Babylonian'},
  ]
  const results = label.index(docs).search('Neo-Babylonian')
  t.plan(1)
  t.same(results.map(({ref}) => ref), ['rank0'])
})
