const fs = require('fs')
const klaw = require('klaw')
const mime = require('mime')
const mkdirp = require('mkdirp')
const cheerio = require('cheerio')
const stringSimilarity = require('string-similarity')
const cryptoRandomString = require('crypto-random-string');
const Snippet = require('./snippet.js')
const chalk = require('chalk')

module.exports = (dir, outputDir) => {
    let data = {}
    data.resources = {
        html: [],
        css: new Set(),
        js: new Set(),
        snippets: []
    }

    klaw(dir)
        .on('data', function (resource) {
            let content;
            try {
                content = fs.readFileSync(resource.path);
                resource.path = resource.path.split("/").slice(3).join("/")
                resource['data'] = content.toString()
                resource['type'] = mime.getType(resource.path)

                console.log(`Analyzing ${chalk.blue(resource.path)}`)
                // resource has {data, path, stats, type}
                let type = resource.type

                if (type.includes("html")) {
                    let html = parseHTML(resource.data)
                    resource.data = html
                    data.resources.html.push(resource)
                } else {
                    if (type.includes('css')) {
                        data.resources.css.add(resource)
                    } else if (type.includes('js') || type.includes('javascript')) {
                        data.resources.js.add(resource)
                    } else {
                        if (!data.resources[type]) {
                            data.resources[type] = new Set()
                        }
                        data.resources[type].add(resource)
                    }
                }

            } catch (err) {}
        })

        .on('end', function () {
        // we need to iterate through each fs.stat folders
            mkdirp(outputDir, (err) => {
                if (err) {
                    // console.log(err)
                } else {
                    for (let key in data.resources) {
                        // console.log(data.resources[key])
                        if (key !== "snippets" && key !== "html") {

                            let total = [...data.resources[key]].map((a) => {
                                return a.data
                            }).join("")
                            key = key.split("/").join("-")
                            fs.writeFile(`${outputDir}/all.${key}`, total, (err) => {
                                if (err) {
                                    // console.log(err)
                                }
                            })
                        } else if (key === "html") {
                            data.resources[key].forEach((resource) => {
                                mkdirp(`${outputDir}/html/${resource.path.split("/").slice(0,-1).join("/")}`, (err) => {
                                    if (err) {return}
                                    fs.writeFile(`${outputDir}/html/${resource.path}`, resource.data, (err) => {
                                        if (err) {
                                            // console.log(err)
                                        }
                                    })  
                                })
                            })
                        } else {
                            data.resources[key].forEach(snippet => {
                                mkdirp(`${outputDir}/snippets/`, (err) => {
                                    if (err) {return}
                                    fs.writeFile(`${outputDir}/snippets/${snippet.id}--${snippet.hits}.html`, snippet.html, (err) => {
                                        if (err) {
                                            // console.log(err)
                                        }
                                    })
                                })
                            })
                        }
                    }
                    console.log(`${chalk.black.bgGreen(`Completed Analyzing!`)} Full unaltertered website structure available at ${chalk.green(dir)}`)
                }
            })
        })
        .on('error', function (err, item) {
            // console.log(err.message)
            // console.log(item.path) // the file the error occurred on
        })
    ;
}

function parseHTML(htmlData) {

    const $ = cheerio.load(htmlData)

    let targets = ["nav", "header", "content", "footer"]

    targets.forEach((selector) => {
        let htmlText = ""
        htmlText += safelyGetHTML($, selector) // only get one because then snippet replacing makes no sense
        let snippet = addSnippet(selector, htmlText)
        if (snippet !== "no snippet") {
            $(`.${selector}`).replaceWith(`{{${snippet.id}}}`)
        }
    })
    return $.html()
}

function addSnippet(id, text) {
    if (text == "") {return "no snippet"}
    let snippet = new Snippet(id, text)
    let highestSimilarity = 0
    let similarSnippet = new Snippet("NOT A SNIPPET", "NOPE")
    data.resources.snippets.forEach((s) => {
        let similarity = stringSimilarity.compareTwoStrings(s.html, snippet.html)
        similarSnippet = (similarity > highestSimilarity) ? s : similarSnippet
        highestSimilarity = (similarity > highestSimilarity) ? similarity : highestSimilarity
    })

    if (highestSimilarity > 0.7) { // snippet is not unique. log another entry of this (potentially return to html to let know there)
        similarSnippet.hits ++
        // data.resources.snippets[data.resources.snippets.indexOf(similarSnippet)]
        snippet = similarSnippet
        // console.log(`hit for ${snippet.id}`)
    } else { // snippet is unique. create a new snippet
        snippet.id = `${snippet.id}-${cryptoRandomString(4)}` // made random so that each snippet has a different filename
        data.resources.snippets.push(snippet)
    }
    return snippet
}

function safelyGetHTML($, selector) {
    let html = $.html($(`.${selector}`))
    if (html == null) {return ""}
    return html
}