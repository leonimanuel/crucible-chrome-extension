let contextMenuitem = {
	"id": "selectFactId",
	"title": "selectFactTitle",
	"contexts": ["selection"]
}

chrome.contextMenus.create(contextMenuitem);

chrome.contextMenus.onClicked.addListener(function(clickData) {
	if (clickData.menuItemId == "selectFactId" && clickData.selectionText) {

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

				console.log(clickData.selectionText, tabooli)

				fetch("http://localhost:3000/facts", configObj)
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
	}
})

















