#!/usr/bin/env node

var program = require('commander')
const chalk = require('chalk')

// require scraping tools
const scrape = require('./src/scraper')

program
  // .command('<url> <dir>')
  .option('-u, --URL <s>', 'The URL to start scraping')
  .option('-d, --dir <s>', 'The root directory for fies to be saved')
  .action(function(url, dir) {
    // scrape(url, dir).then(...)?
    console.log(chalk.bgMagenta(`scraping ${chalk.green(url)} to ${chalk.green(dir)}`))
    scrape(url, dir)
  })

program.parse(process.argv)
