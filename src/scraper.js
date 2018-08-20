const cheerio = require('cheerio')
const fetch = require('node-fetch')
const chalk = require('chalk')
const fs = require('fs')

module.exports = function(url, path) {
  // flow control
  console.log('starting scrape of' + url)
  scrape(url)
    .then(data => {
      // save the resources
      console.log(chalk.red('scrape cheerio return'), data)
      const resources = saveResource(parseResources(page, path), path)
      // determine if there are more links
      return findInternalLinks(page)
    })
    .then()
    .catch(console.error)
}

const scrape = async url => {
  const page = await fetch(url).then(data => data.text)

  return cheerio.load(page, {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
  })
}

const parseResources = list => {
  // returns a promise, containg an object with
  // 'dir/filename.css' as a key, and the data as the value
}

const saveResource = (resourceObject, path) => {
  // create non-existant dirs
  // write resource
}

const findInternalLinks = links => {
  // return only internal links
}

const sequenceUrlFetch = urls => {
  // sequentially scrape URLS
}
