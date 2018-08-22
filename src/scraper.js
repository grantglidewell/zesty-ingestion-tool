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
}

module.exports = (url, userPath) => {
  const dir = path.resolve(process.cwd(), userPath)
  let pathArray = url.split( '/' );
  let protocol = pathArray[0];
  let host = pathArray[2];
  
  let options = {
    urls: [url],
    urlFilter: (urlToCheck)  => {
      if (tracking.urls.has(urlToCheck.split('/').slice(2))) {
        return true
      }
      else {
        return (urlToCheck.indexOf(host) !== -1)
      }
    },
    directory: dir,
    recursive: true,
    ignoreErrors: true,
    filenameGenerator: 'bySiteStructure',
    onResourceSaved: (resource) => {
      console.log(`Saving ${resource}!`)
      tracking.urls.add(resource.url.split('/').slice(2))
    }
  }
  scrape(options).then((result) => {

  }).catch((err) => {
    console.error(err)
  })
}