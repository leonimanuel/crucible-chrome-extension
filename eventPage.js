// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse ) {
// 	if (request.todo === "showPageAction") {

// 	}
// })

let addFactMenuitem = {
	"id": "addFactId",
	"title": "add fact",
	"contexts": ["selection"]
}

let rephraseAndAddFactMenuitem = {
	"id": "rephraseFactId",
	"title": "rephrase fact and add",
	"contexts": ["selection"]
}

chrome.contextMenus.create(addFactMenuitem);
chrome.contextMenus.create(rephraseAndAddFactMenuitem);

chrome.contextMenus.onClicked.addListener(function(clickData) {
	if (clickData.menuItemId == "addFactId" && clickData.selectionText) {

		function getCurrentTab(callback){ //Take a callback
		    var theTab;
		    chrome.tabs.query({active:true, currentWindow:true},function(tabs){
		        return callback(tabs[0]);
		    });
		};

		function displayTab(tab) {
	    console.log(tab.url)
	    tabooli = tab.url
	    return tab.url;
	  };

 		let x = getCurrentTab(displayTab);
 		
		function meFirst() {
			console.log(tabooli)
		}

 		// setTimeout(meFirst, 2000);
		

		function postData() {
			let token = chrome.storage.sync.get("token", (result) => {
				let configObj = {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: result.token
					},
					body: JSON.stringify({
							"selected_text": clickData.selectionText,
							"selection_url": tabooli			
					})
				}

				fetch("https://crucible-api.herokuapp.com/facts", configObj)
					.then(resp => resp.json())
					.then(function(object) {
						console.log(object)
					})
					.catch(function(error) {
						alert(error.message);
					})			
			
				console.log("postData DONE")
			})
		}

		setTimeout(postData, 500)
	} else if (clickData.menuItemId == "rephraseFactId" && clickData.selectionText) {
			debugger	
			chrome.runtime.sendMessage({greeting: "changeColor"}, function(response) {
			  console.log(response.farewell);
			});
	}
})

















