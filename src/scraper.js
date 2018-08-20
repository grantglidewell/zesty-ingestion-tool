const cheerio = require('cheerio')
const fetch = require('node-fetch')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

// TODO: track files that have been saved already to prevent
// repeated downloads of resources

module.exports = function(url, userPath) {
  const dir = path.resolve(process.cwd(), userPath)
  // flow control
  // do some validation on the url
  // make sure it has a trailing slash
  scrape({ url, dir })
    .then(data => {
      // identify resources that are not html (not in links)
      const list = Array.from(data('a'))
      const links = parseInternalLinks(list, url)
      return sequenceUrlFetch(links, url, dir)
    })
    .then(console.log)
    .catch(console.error)
}

const scrape = async opts => {
  if (opts.domain) {
    opts.FullURL = `${opts.domain}${opts.url}`
  } else {
    opts.FullURL = opts.url
  }
  console.log('scraping ' + chalk.yellow(opts.url))
  const page = await fetch(opts.FullURL).then(data => {
    return data.text()
  })
  saveHTML(page, opts.domain ? `${opts.dir}/${opts.url}` : opts.dir)
  const $ = cheerio.load(page, {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: true,
    decodeEntities: true
  })
  return $
}

const parseInternalLinks = list => {
  // filter out any outside links
  const links = list
    .filter(item => item.attribs.href && !item.attribs.href.includes('http'))
    .reduce((acc, item) => {
      acc.push(
        item.attribs.href.indexOf('/') === 0
          ? item.attribs.href.substr(1)
          : item.attribs.href
      )
      return acc
    }, [])
  // get rid of duplicate entries
  const setLinks = new Set(links)
  return Array.from(setLinks)
  // scrape each subsequent
  // 'dir/filename.css' as a key, and the data as the value
}

const saveHTML = (page, dir) => {
  // console.log(chalk.green('args in saveResource'), page, dir)
  // maybe run this in a try catch?
  // create non-existant dirs
  if (fs.existsSync(dir)) {
    console.log('dir exists')
    fs.writeFileSync(`${dir}/index.html`, page)
  } else {
    fs.mkdirSync(dir)
    fs.writeFileSync(`${dir}/index.html`, page)
  }
  console.log(chalk.green(`wrote file to ${dir}`))
  // write resource
}

const sequenceUrlFetch = (urls, domain, dir) => {
  urls.map(url => {
    return scrape({ domain, url, dir })
  })
  // return funcs.reduce(
  //   (promise, func) =>
  //     promise.then(result => func().then(Array.prototype.concat.bind(result))),
  //   Promise.resolve([])
  // )
}
