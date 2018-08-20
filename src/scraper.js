const cheerio = require('cheerio')
const fetch = require('node-fetch')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

module.exports = function(url, userPath) {
  const dir = path.resolve(process.cwd(), userPath)
  // flow control
  scrape(url, dir)
    .then(data => {
      // save the resources
      // console.log(chalk.red('scrape cheerio return '), data)
      const list = Array.from(data('a'))
      // const resources = saveResource(parseResources(list, path), path)
      // determine if there are more links
      // return findInternalLinks(page)s
    })
    .then()
    .catch(console.error)
}

const scrape = async (url, dir) => {
  const page = await fetch(url).then(data => {
    return data.text()
  })
  saveResource(page, dir)
  const $ = cheerio.load(page, {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
  })
  return $
}

const parseResources = (list, dir) => {
  // console.log('Args in resources', list, dir)
  // returns a promise, containg an object with
  // 'dir/filename.css' as a key, and the data as the value
}

const saveResource = (page, dir) => {
  console.log(chalk.green('args in saveResource'), page, dir)
  // create non-existant dirs
  if (fs.existsSync(dir)) {
    fs.writeFileSync(`${dir}/index.html`, page)
  } else {
    fs.mkdirSync(dir)
    fs.writeFileSync(`${dir}/index.html`, page)
  }
  // write resource
  // return something that says the file has been written and scraping can continue
}

const findInternalLinks = links => {
  // return only internal links
}

const sequenceUrlFetch = urls => {
  // sequentially scrape URLS
}
