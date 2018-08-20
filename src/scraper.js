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
      console.log(chalk.red('scrape cheerio return '), data)
      // identify resources that are not html (not in links)
      const list = Array.from(data('a'))
      const links = parseLinks(list, path)
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
  // do we want to save the resource for each page
  // or have a parser sort and then save them>
  // saveResource(page, dir)
  const $ = cheerio.load(page, {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
  })
  return $
}

const parseLinks = (list, dir) => {
  // console.log('Args in resources', list, dir)
  // filter out any outside links
  list.filter(item => !item.attribs.href.includes('http')).map(item => {
    console.log(item.attribs)
  })
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
