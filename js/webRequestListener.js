/** 
  * @desc Listener for all webRequest API
  * 			WebRequest's Life Cycle: https://developer.chrome.com/extensions/webRequest
*/

// Global variables for webRequestListener
var inspectedTabIds = [];

// Collections of requests per tabId 
// ex) tabId => {requestId1: webRequest1, requestId2: webRequest2, ...}
// var requestsHolder = {}; // var requestQueue = {};
var requests = {};

// onSendHeaders: Before the requests are sent to the network.
chrome.webRequest.onSendHeaders.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			let request = new WebRequest(details);
     
			if (!isInRequests(requests, details.tabId)) {
				requests[details.tabId] = {};
			}

			requests[details.tabId][request.getRequestId()] = request;
			console.log(request);
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
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				requests[details.tabId][details.requestId].setOnHeaderReceivedTimeStamp(details.timeStamp);
				// requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
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
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
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

// onCompleted Request: For onComplete timestamp.
chrome.webRequest.onCompleted.addListener(
	function(details) {
    let tabId = details.tabId;
    if (inspectedTabIds.indexOf(tabId) > -1) {
			if (isInTab(requests[details.tabId], details.requestId)) {
				// console.log(requests[details.tabId][details.requestId]);
        requests[details.tabId][details.requestId].setOnCompletedTimeStamp(details.timeStamp);
        requests[details.tabId][details.requestId] = updateResponse(requests[details.tabId][details.requestId], details);
        sendRequestObject(requests[details.tabId][details.requestId]);
			}
		}
	 },
	{
		urls: ["<all_urls>"]
	},
	["responseHeaders"]
)


// onBeforePageReload - Reset 
chrome.webNavigation.onBeforeNavigate.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
      console.log("We're about to refresh the page please reset-------------------------------------------------------------------'");
      chrome.runtime.sendMessage({
        type: 'webnavigation-before-refresh', 
        tabId: details.tabId, 
        from: 'webRequestListener.js'
      });
		}
	}
);

function sendRequestObject(requestObj) {
  chrome.runtime.sendMessage({
    type: 'web-request-objects',
    message: requestObj, 
    tabId: requestObj.tabId, 
    from: 'webRequestListener.js'
  });
}

// onCompleted Page
chrome.webNavigation.onCompleted.addListener(
	function(details) {
		if (inspectedTabIds.indexOf(details.tabId) > -1) {
			chrome.runtime.sendMessage({
         type: 'page-onload-event', 
         message: details, 
         tabId: details.tabId, 
         from: 'webRequestListener.js'
      });
		}
	}
);

function addToListener(newTabId, callback) {
  if (inspectedTabIds.indexOf(newTabId) < 0) {
    inspectedTabIds.push(newTabId);
    callback(newTabId);
    // console.log("inspectedTabIds: " + inspectedTabIds);
  } else {
    console.log("already listening");
  }
}

function removeFromListner(closedTabId) {
  if (inspectedTabIds.indexOf(closedTabId) >= 0) {
    inspectedTabIds.splice(inspectedTabIds.indexOf(closedTabId), 1);
    console.log("removed, inspectedTabIds: "+ inspectedTabIds);
    delete requests[closedTabId];
  }
}

// Panel is ready to receive WebRequests
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type.match('panel-ready')) {  
    chrome.runtime.sendMessage({
      type: 'web-requests-array',
      message: requests[message.tabId], 
      tabId: message.tabId,
      from: 'devTools.js'
    });
  };
});

// Testing customized Keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
  if (command.match('toggle-feature-foo')) {
  	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		let currentTab = tabs[0];
  		// console.log(currentTab);
  		// reloadPage(currentTab.id);
  		if (currentTab) {
  			if (inspectedTabIds.indexOf(currentTab.id) > -1) {
	      	reloadPage(currentTab.id);
	      }
  		}
    });
  }
});

function reloadPage(tabId) {
	chrome.runtime.sendMessage({
		type: "reload-shortcut",
		tabId: tabId
	});

	requests[tabId] = {};

	sleep(2000);

	requests[tabId] = {};

	chrome.tabs.reload(tabId, {bypassCache: true});
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
