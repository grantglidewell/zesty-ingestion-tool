let data = {}
class ZestyResourceSaver {
	constructor() {
		data.resources = {
			html: new Set(),
			css: new Set(),
			snippets: new Set()
		}
	}
	saveResource(resource) {
		let type = resource.metadata.headers["content-type"]
		if (type.includes("text/html")) {
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
			data.resources.html.add(resource)
		}
		else {
			if (!data.resources[type]) {
				data.resources[type] = new Set()
			}
			data.resources[type].add(resource)	
		}
	}

	errorCleanup(err) {

	}
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

function onScraperFinish(result) {
	console.log('now what')
}
module.exports = {
	ResourceSaver: ZestyResourceSaver,
	resourceScraperFinished: onScraperFinish
}