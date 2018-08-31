const cheerio = require('cheerio')
const fetch = require('node-fetch')
const scrape = require('website-scraper')
const analyze = require('./analyze.js')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const cryptoRandomString = require('crypto-random-string');

// TODO: track files that have been saved already to prevent
// repeated downloads of resources

const tracking = {
  urls: new Set([]),
  depth: 0
}

module.exports = (url, userPath) => {
  const dir = path.resolve(process.cwd(), `/tmp/tempDir-${cryptoRandomString(4)}`)
  const outputDir = path.resolve(process.cwd(), userPath)
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
    httpResponseHandler: (response) => {
      if (response.statusCode === 404) {
        return Promise.reject(new Error('status is 404'));
      } 
      else {
        return Promise.resolve(response.body)
      }
    },
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
    analyze(dir, outputDir)
  }).catch((err) => {
    console.error(err)
  })
}
/*
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const Zesty = require('./zesty.js')
const scrape = require('website-scraper')
const urlParser = require('url')
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
      if (tracking.urls.has(urlParser.parse(urlToCheck).pathname)) {
        return false
      }
      else {
        return (urlToCheck.includes(host))
      }
    },
    resourceSaver: Zesty.ResourceSaver,
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
      tracking.urls.add(urlParser.parse(resource.url).split('/').slice(2))
    }
  }
  scrape(options).then((result) => {
    Zesty.resourceScraperFinished(result, dir)
  }).catch((err) => {
    console.error(err)
  })
}*/