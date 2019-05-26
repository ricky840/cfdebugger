// Request Listener
// Listeners in the order of WebRequest's Life Cycle: https://developer.chrome.com/extensions/webRequest

var selectedTabId;
var readRequests = false;

// onSendHeaders: Before the requests are sent to the network.
chrome.webRequest.onSendHeaders.addListener(
	function(details) {
	    if (isActiveTab(details)) {
	    	printRequestLog("onSendHeaders", details);
			sendMessage("onSendHeaders", details);
	    }
	},
	{
		urls: ["<all_urls>"]
	},
	["requestHeaders"]
)

// onHeadersReceived: First HTTP response header is received.
chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		if (isActiveTab(details)) {
			// printRequestLog("onHeaderReceived", details);
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: Response Listener
chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			// printRequestLog("onResponseStarted", details);
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
);

chrome.webRequest.onCompleted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			// printRequestLog("onCompleted", details);
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

function printRequestLog(requesType, details) {
	console.log(requesType);
	console.log(details);
}

function isActiveTab(requestDetails) {
	if (requestDetails) {
		if (!selectedTabId) {
			chrome.tabs.query({
				active:true,
				currentWindow:true
			},function(tab) {
				if (tab !== undefined && tab.length != 0) {
					selectedTabId = tab[0].id;
				}
			})
		}

		if (requestDetails.tabId == selectedTabId) {
	    	return true;
	    }
	}

	return false;
}

function sendMessage(requestType, details) {
	chrome.tabs.sendMessage(details.tabId, {message: "Hi there..."})
}

chrome.tabs.onActivated.addListener(
	function(activeInfo) {
		selectedTabId = activeInfo.tabId;
	}
)

// Fires when a page is updated (reload, different URL, or even Spotify changed song)
// changeInfo: 'loading', 'complete'
// Shouldn't rely on this API, some of the requests may not go through.
chrome.tabs.onUpdated.addListener(
	function(tabId, changeInfo, tab) {
		if (changeInfo.status == "loading") {
			readingRequests = true;
		} else if (changeInfo.status == "complete") {
			readingRequests = false;
		}
	}
)

// Sameple Logs for `http://durianlovers.cf/random.jpg`


//// onSendHeaders

// frameId: 0
// method: "GET"
// parentFrameId: -1
// requestHeaders: Array(4)
// 0: {name: "Upgrade-Insecure-Requests", value: "1"}
// 1: {name: "User-Agent", value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) Ap…L, like Gecko) Chrome/74.0.3729.169 Safari/537.36"}
// 2: {name: "Accept", value: "text/html,application/xhtml+xml,application/xml;q=…e/apng,*/*;q=0.8,application/signed-exchange;v=b3"}
// 3: {name: "Purpose", value: "prefetch"}
// length: 4
// __proto__: Array(0)
// requestId: "23855"
// tabId: 439
// timeStamp: 1558873102226.462
// type: "main_frame"
// url: "https://durianlovers.cf/random.jpg"


//// onHeaderReceived

// frameId: 0
// method: "GET"
// parentFrameId: -1
// requestId: "23855"
// responseHeaders: Array(14)
// 0: {name: "status", value: "200"}
// 1: {name: "date", value: "Sun, 26 May 2019 12:18:22 GMT"}
// 2: {name: "content-type", value: "image/jpeg"}
// 3: {name: "content-length", value: "1042592"}
// 4: {name: "last-modified", value: "Fri, 05 Apr 2019 03:14:57 GMT"}
// 5: {name: "etag", value: ""fe8a0-585bfe43c2310""}
// 6: {name: "cf-cache-status", value: "MISS"}
// 7: {name: "expires", value: "Sun, 26 May 2019 16:18:22 GMT"}
// 8: {name: "cache-control", value: "public, max-age=14400"}
// 9: {name: "accept-ranges", value: "bytes"}
// 10: {name: "expect-ct", value: "max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct""}
// 11: {name: "vary", value: "Accept-Encoding"}
// 12: {name: "server", value: "cloudflare"}
// 13: {name: "cf-ray", value: "4dcfb0f9c98cc327-SIN"}
// length: 14
// __proto__: Array(0)
// statusCode: 200
// statusLine: "HTTP/1.1 200"
// tabId: 439
// timeStamp: 1558873102669.321
// type: "main_frame"
// url: "https://durianlovers.cf/random.jpg"


//// onResponseStarted

// frameId: 0
// fromCache: false
// ip: "104.19.239.22"
// method: "GET"
// parentFrameId: -1
// requestId: "23855"
// responseHeaders: Array(14)
// 0: {name: "status", value: "200"}
// 1: {name: "date", value: "Sun, 26 May 2019 12:18:22 GMT"}
// 2: {name: "content-type", value: "image/jpeg"}
// 3: {name: "content-length", value: "1042592"}
// 4: {name: "last-modified", value: "Fri, 05 Apr 2019 03:14:57 GMT"}
// 5: {name: "etag", value: ""fe8a0-585bfe43c2310""}
// 6: {name: "cf-cache-status", value: "MISS"}
// 7: {name: "expires", value: "Sun, 26 May 2019 16:18:22 GMT"}
// 8: {name: "cache-control", value: "public, max-age=14400"}
// 9: {name: "accept-ranges", value: "bytes"}
// 10: {name: "expect-ct", value: "max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct""}
// 11: {name: "vary", value: "Accept-Encoding"}
// 12: {name: "server", value: "cloudflare"}
// 13: {name: "cf-ray", value: "4dcfb0f9c98cc327-SIN"}
// length: 14
// __proto__: Array(0)
// statusCode: 200
// statusLine: "HTTP/1.1 200"
// tabId: 439
// timeStamp: 1558873102670.2322
// type: "main_frame"
// url: "https://durianlovers.cf/random.jpg"


//// onCompleted

// frameId: 0
// fromCache: false
// ip: "104.19.239.22"
// method: "GET"
// parentFrameId: -1
// requestId: "23855"
// responseHeaders: Array(14)
// 0: {name: "status", value: "200"}
// 1: {name: "date", value: "Sun, 26 May 2019 12:18:22 GMT"}
// 2: {name: "content-type", value: "image/jpeg"}
// 3: {name: "content-length", value: "1042592"}
// 4: {name: "last-modified", value: "Fri, 05 Apr 2019 03:14:57 GMT"}
// 5: {name: "etag", value: ""fe8a0-585bfe43c2310""}
// 6: {name: "cf-cache-status", value: "MISS"}
// 7: {name: "expires", value: "Sun, 26 May 2019 16:18:22 GMT"}
// 8: {name: "cache-control", value: "public, max-age=14400"}
// 9: {name: "accept-ranges", value: "bytes"}
// 10: {name: "expect-ct", value: "max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct""}
// 11: {name: "vary", value: "Accept-Encoding"}
// 12: {name: "server", value: "cloudflare"}
// 13: {name: "cf-ray", value: "4dcfb0f9c98cc327-SIN"}
// length: 14
// __proto__: Array(0)
// statusCode: 200
// statusLine: "HTTP/1.1 200"
// tabId: 439
// timeStamp: 1558873103012.791
// type: "main_frame"
// url: "https://durianlovers.cf/random.jpg"
