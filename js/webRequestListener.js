/** 
  * @desc Listener for all webRequest API
  * 			WebRequest's Life Cycle: https://developer.chrome.com/extensions/webRequest
*/

// Global variables for webRequestListener
var selectedTabId;
var devToolEnabled = false;

// Collections of requests per tabId 
// ex) tabId => {requestId1: webRequest1, requestId2: webRequest2, ...}
var requests = {};
var requestsHolder = {};
var requestQueue = {};

// onSendHeaders: Before the requests are sent to the network.
chrome.webRequest.onSendHeaders.addListener(
	function(details) {
    if (isActiveTab(details)) {
			let request = new WebRequest(details);
			if (!isInRequests(requests, details.tabId)) {
				console.log('create new tab');
				requests[details.tabId] = {};
			}

			requests[details.tabId][request.getRequestId()] = request;
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
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: For onResponseStarted timestamp.
chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId].setOnResponseStartedTimeStamp(details.timeStamp);
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
);

// onCompleted: For onComplete timestamp.
chrome.webRequest.onCompleted.addListener(
	function(details) {
		if (isActiveTab(details)) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId].setOnCompletedTimeStamp(details.timeStamp);

				// Send message to background.js or contentScript.js
				sendMessage('web-request-object', requests[details.tabId][details.requestId], 'webRequestListener.js');
			}
		}
	},
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)

// onResponseStarted: Response Listener
chrome.tabs.onActivated.addListener(
	function(activeInfo) {
		selectedTabId = activeInfo.tabId;
	}
)

chrome.runtime.onMessage.addListener(
	function(message, sender, sendResponse) {
		if (message.from.match(FROM_POPUP_JS)) {
			printRequests();
		} else if (message.type.match(NEW_INSTPECTED_WINDOW_TABID)) {
			console.log(`
					Received Tab ID: ${message.message}
					selected Tab ID: ${selectedTabId}
				`);
			devToolEnabled = true;
		}
	}
)

// Reset 
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
		if (isActiveTab(details)) {
			if (selectedTabId) {
				// Handle browser cache: solution disable broswer cache by default
				// console.log(details);
				delete requests[selectedTabId];
			}
		}
	}
);
