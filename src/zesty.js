const Snippet = require('./snippet.js')
const cheerio = require('cheerio')
const fs = require('fs')
const mkdirp = require('mkdirp')
const stringSimilarity = require('string-similarity')
const cryptoRandomString = require('crypto-random-string');

let data = {}
class ZestyResourceSaver {
	constructor() {
		data.resources = {
			html: new Set(),
			css: new Set(),
			js: new Set(),
			snippets: []
		}
	}

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
	saveResource(resource) {

		let type = resource.metadata.headers["content-type"]
		console.log(type)
		if (type.includes("text/html")) {
			let html = this.parseHTML(resource.text)
			resource.text = html
			data.resources.html.add(resource)
		}
		else {
			if (type.includes('css')) {
				data.resources.css.add(resource)
			} else if (type.includes('js') || type.includes('javascript')) {
				data.resources.js.add(resource)
			} else{
				if (!data.resources[type]) {
					data.resources[type] = new Set()
				}
				data.resources[type].add(resource)
			}
		}
	}

	parseHTML(htmlData) {

		const $ = cheerio.load(htmlData)

		let targets = ["nav", "header", "content", "footer"]

		targets.forEach((selector) => {
			let htmlText = ""
			htmlText += safelyGetHTML($, selector) // only get one because then snippet replacing makes no sense
			let snippet = this.addSnippet(selector, htmlText)
			if (snippet !== "no snippet") {
				$(`.${selector}`).replaceWith(`{{${snippet.id}}}`)
			}
		})
		return $.html()
		/*
		// // use cheerio to look for ./tag/#nav elems -> put in tracking set() -> if filename is returned replace with snippet
		let htmlText = ""
		let selector = 'nav'
		htmlText += safelyGetHTML($(`.${selector}`).html()) // only get one because then snippet replacing makes no sense
		// htmlText += safelyGetHTML($('#nav').html()) 
		// htmlText += safelyGetHTML($('nav').html())
		let snippet = this.addSnippet(selector, htmlText)
		$(`.${selector}`).replaceWith($(`<span>{{${snippet.id}}}</span>`))	

        // use cheerio to look for ./tag/#header elems -> put in tracking set() -> if filename is returned replace with snippet
        htmlText = ""
		htmlText += safelyGetHTML($('.header').html())
		htmlText += safelyGetHTML($('#header').html())
		htmlText += safelyGetHTML($('header').html())
		snippet = new Snippet("header", htmlText)
		this.addSnippet(snippet)
        
        // use cheerio to look for ./tag/#content elems -> put in tracking set() -> if filename is returned replace with snippet
        htmlText = ""
		htmlText += safelyGetHTML($('.content').html())
		htmlText += safelyGetHTML($('#content').html())
		htmlText += safelyGetHTML($('content').html())
		snippet = new Snippet("content", htmlText)
		this.addSnippet(snippet)
        
        // use cheerio to look for ./tag/#footer elems -> put in tracking set() -> if filename is returned replace with snippet
        htmlText = ""
		htmlText += safelyGetHTML($('.footer').html())
		htmlText += safelyGetHTML($('#footer').html())
		htmlText += safelyGetHTML($('footer').html())
		snippet = new Snippet("footer", htmlText)
		this.addSnippet(snippet)
		*/
	}

	addSnippet(id, text) {
		if (text == "") {return "no snippet"}
		let snippet = new Snippet(id, text)
		let highestSimilarity = 0
		let similarSnippet = new Snippet("NOT A SNIPPET", "NOPE")
		data.resources.snippets.forEach((s) => {
			let similarity = stringSimilarity.compareTwoStrings(s.html, snippet.html)
			similarSnippet = (similarity > highestSimilarity) ? s : similarSnippet
			highestSimilarity = (similarity > highestSimilarity) ? similarity : highestSimilarity
		})

		// data.resources.snippets.reduce((highestSimilarity, currentSnippet) => {

		// 	let similarity = stringSimilarity.compareTwoStrings(currentSnippet.html, snippet.html)

		// 	highestSimilarity = (similarity > highestSimilarity) ? similarity : highestSimilarity
		// 	similarSnippet = (similarity > highestSimilarity) ? s : similarSnippet
		// })

		if (highestSimilarity > 0.7) { // snippet is not unique. log another entry of this (potentially return to html to let know there)
			similarSnippet.hits ++
			// data.resources.snippets[data.resources.snippets.indexOf(similarSnippet)]
			snippet = similarSnippet
			console.log(`hit for ${snippet.id}`)
		} else { // snippet is unique. create a new snippet
			snippet.id = `${snippet.id}-${cryptoRandomString(4)}` // made random so that each snippet has a different filename
			data.resources.snippets.push(snippet)
		}
		return snippet
		// if (data.resources.snippets[snippet.id]) {
			// somehow merge the snippets together
			/*
				see if im getting the same repeated code
					else make a new snippet
				
			*/
		// } else {

		// }
		  /*
		  	(Not being implemented yet, not sure if this is a good idea. Current above code is a workaround)
		    see if code exists in tracking already, if hits are above 3 (same snippet 3 times) return the filename of the obj stored in tracking, else create it into tracking / log an additional hit
		  */
	}

	errorCleanup(err) {

	}
}

function safelyGetHTML($, selector) {
	let html = $.html($(`.${selector}`))
	if (html == null) {return ""}
	return html
}

function onScraperFinish(result, root) {
	mkdirp(root, (err) => {
		if (err) {
			console.log(err)
		} else {
			for (let key in data.resources) {
				if (key !== "snippets" && key !== "html") {
					let total = [...data.resources[key]].reduce((a,b) => {
						let x = (a['text']) ? a['text'] : ""
						let y = (b['text']) ? b['text'] : ""
						return x + y
					}, "")
					key = key.split("/").join("-")
					fs.writeFile(`${root}/all.${key}`, total, (err) => {
						if (err) {
							console.log(err)
						}
					})
				} else if (key === "html") {
					data.resources[key].forEach((resource) => {
						mkdirp(`${root}/html/${resource.filename.split("/").slice(0,-1).join("/")}`, (err) => {
							if (err) {return}
							fs.writeFile(`${root}/html/${resource.filename}`, resource.text, (err) => {
								if (err) {
									console.log(err)
								}
							})	
						})
					})
				} else {
					data.resources[key].forEach(snippet => {
						mkdirp(`${root}/snippets/`, (err) => {
							if (err) {return}
							fs.writeFile(`${root}/snippets/${snippet.id}--${snippet.hits}.html`, snippet.html, (err) => {
								if (err) {
									console.log(err)
								}
							})
						})
					})
				}
			}
		}
	})
}

module.exports = {
	ResourceSaver: ZestyResourceSaver,
	resourceScraperFinished: onScraperFinish
}