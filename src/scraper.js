const cheerio = require('cheerio')
const fetch = require('node-fetch')

const scrape = require('website-scraper')

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')

// TODO: track files that have been saved already to prevent
// repeated downloads of resources

const tracking = {
  urls: new Set([]),
  depth: 0
}

module.exports = (url, userPath) => {
  const dir = path.resolve(process.cwd(), userPath)
  const pathArray = url.split( '/' );
  const protocol = pathArray[0];
  const host = pathArray[2];
  
  const options = {
    urls: [url],
    urlFilter: (urlToCheck)  => {
      if (tracking.urls.has(urlToCheck.split('/').slice(2))) {
        return false
      }
      else {
        return (urlToCheck.includes(host))
      }
    },
    directory: dir,
    recursive: true,
    ignoreErrors: true,
    filenameGenerator: 'bySiteStructure',
    onResourceSaved: (resource) => {
      console.log(`Saving ${chalk.green(resource.filename)}`)
      if(tracking.depth !== resource.depth) {
        tracking.depth = resource.depth
        console.log(chalk.yellow(`Scrape depth increased to ${tracking.depth}`))
      }
      tracking.urls.add(resource.url.split('/').slice(2))
    }
  }
  scrape(options).then((result) => {

  }).catch((err) => {
    console.error(err)
  })
}

function extractFromResource(resource) {
  /*
    switch over resource type (html/image/js/css/font/etc)
      image: upload to zesty, store in tracking object so we can refer to the image later in the html
      js: put in jumbo js file
      css: put in jumbo css file
      font: put in jumbo css file
      etc: other files just ignore for now
      html: (./tag/# means css class / html tag, html id)
        use cheerio to look for ./tag/#nav elems -> put in tracking set() -> if filename is returned replace with snippet
        use cheerio to look for ./tag/#header elems -> put in tracking set() -> if filename is returned replace with snippet
        use cheerio to look for ./tag/#content elems -> put in tracking set() -> if filename is returned replace with snippet
        use cheerio to look for ./tag/#content elems -> put in tracking set() -> if filename is returned replace with snippet
        use cheerio to look for ./tag/#footer elems -> put in tracking set() -> if filename is returned replace with snippet
  */
}

function putInTrackingSet(code) {
  /*
    see if code exists in tracking already, if hits are above 3 (same snippet 3 times) return the filename of the obj stored in tracking, else create it into tracking / log an additional hit
  */
}