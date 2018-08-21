const cheerio = require('cheerio')
const fetch = require('node-fetch')

const scrape = require('website-scraper')

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

// TODO: track files that have been saved already to prevent
// repeated downloads of resources

const tracking = {
  resources: new Set([]),
  html: new Set([])
}

module.exports = function(url, userPath) {
  const dir = path.resolve(process.cwd(), userPath)
  // flow control
  // TODO: do some validation on the url
  // make sure it has a trailing slash
  scrape({ url, dir })
    .then(data => {
      // identify resources that are not html (not in links)
      const list = Array.from(data('a'))
      const links = parseInternalLinks(list, url)
      return sequenceUrlFetch(links, url, dir)
    })
    .catch(console.error)
}

// TODO: replace this with scrape from 'website-scraper'
// const scrape = async opts => {
//   if (opts.domain) {
//     opts.FullURL = `${opts.domain}${opts.url}`
//   } else {
//     opts.FullURL = opts.url
//   }
//   console.log('scraping ' + chalk.yellow(opts.url))
//   const page = await fetch(opts.FullURL)
//     .then(data => {
//       return data.text()
//     })
//     .catch(err => console.log('fetch err', opts.FullURL))
//   saveHTML(page, opts.domain ? `${opts.dir}/${opts.url}` : opts.dir)
//   const $ = cheerio.load(page, {
//     withDomLvl1: true,
//     normalizeWhitespace: false,
//     xmlMode: true,
//     decodeEntities: true
//   })
//   return $
// }

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
    .filter(link => {
      // this needs to be more specific and include the current domain
      if (
        link.includes('#') ||
        link.includes('mailto:') ||
        link.includes('?') ||
        link.includes('.asp')
      ) {
        return false
      }
      return true
    })
  // get rid of duplicate entries
  const setLinks = new Set(links)
  return Array.from(setLinks)
}

const saveHTML = (page, dir) => {
  //check if dir has a suffix, if not assume index.html
  if (dir.endsWith('htm') || dir.endsWith('html')) {
    if (fs.existsSync(dir.substr(0, dir.lastIndexOf('/') + 1))) {
      fs.writeFileSync(dir, page)
    } else {
      fs.mkdirSync(dir.substr(0, dir.lastIndexOf('/') + 1))
      fs.writeFileSync(dir, page)
    }
  } else {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(dir + '/index.html', page)
    } else {
      fs.mkdirSync(dir)
      fs.writeFileSync(dir + '/index.html', page)
    }
  }
  console.log(chalk.green(`wrote file to ${dir}`))
  // write resource
}

const sequenceUrlFetch = (urls, domain, dir) => {
  urls.map(url => {
    return scrape({ domain, url, dir }).catch(console.log)
  })
}
