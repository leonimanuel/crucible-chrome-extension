let isSignedIn = false
let actionType = "fact"

chrome.storage.sync.get("name", (result) => {
	if (result.name) {
		showUser(result.name)
	} else {
		$("#login-form").css("display", "block")
	}
})

let loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
	e.preventDefault()
	let configObj = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json"
		},
		body: JSON.stringify({
			email: document.getElementById("email-input").value,
			password: document.getElementById("password-input").value
		})
	}

	// fetch("https://crucible-api.herokuapp.com" + "/authenticate", configObj)
	fetch(API_ROOT + "/authenticate", configObj)
		.then(resp => resp.json())
		.then(data => {
			if (data.auth_token) {
				console.log(data.auth_token)
				chrome.storage.sync.set({
					"token": data.auth_token,
					"name": data.user.name,
					"unreads": data.user.unread_messages_count
				}, (result) => {					
					chrome.browserAction.setBadgeText({"text": data.user.unread_messages_count.toString()});
					if (data.user.unread_messages_count === 0) {
						chrome.browserAction.setBadgeBackgroundColor({color: "#318fb5"})
					} else {
						chrome.browserAction.setBadgeBackgroundColor({color: "red"})
					}
					
					$("#login-form").css("display", "none")
					isSignedIn = true
					showUser(data.user.name)
				})
			} else {
				const loginError = document.createElement("div");
				loginError.innerText = "Invalid credentials. Please try again."
				loginError.style.color = "red"
				$("#password-input-wrapper").after(loginError)
			}
		})
		.catch(err => alert(err.message))
})

showUser = (name) => {
	$("#user-name").text(name);
	$("#logout-button").css("display", "block");
	
	// Grab selection
	chrome.tabs.executeScript({
	    code: "window.getSelection().toString();"
	}, function(selection) {
	    // if (isSignedIn) {
		    if (selection[0]) {
		    	document.getElementById("selection-wrapper").innerHTML = selection[0]
		    	document.getElementById("selection-view").style.display = "block"
		    } else {
		    	$("#no-selection-view").css("display", "block")
		    }
	    // }
	});

	chrome.storage.sync.get(["rephrase", "lastSelection"], (result) => {
		// if (result.lastSelection === document.getElementById("selection-wrapper").innerText) {
			$("#rephrase-input").val(result.rephrase ? result.rephrase : "")
		// }
	});
}

const submitFactForm = document.getElementById("submit-fact-form")
submitFactForm.addEventListener("submit", (e) => {
	e.preventDefault();
	getTab(postFact);
})

getTab = (callback) => {
	chrome.tabs.query({active:true, currentWindow:true},function(tabs){
	  callback(tabs[0].url);
	});	
}

postFact = (tab) => {
	let token = chrome.storage.sync.get("token", (result) => {
		
		// Grab selection paragraph (for context)
		chrome.tabs.executeScript({
		    code: "window.getSelection().anchorNode.parentNode.innerText"
		}, function(selection) {
			
			// Configure POST request
			let configObj = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: result.token
				},
				body: JSON.stringify({
						"selected_text": document.getElementById("selection-wrapper").innerText,
						"paragraph_text": selection[0],
						"rephrase": document.getElementById("rephrase-input").value,
						"selection_url": tab			
				})
			}
			fetch(API_ROOT + "/add-from-extension", configObj)
				.then(resp => resp.json())
				.then(function(object) {
					if (object.status === "success") {
						$("#main").empty()
						document.getElementById("successful-fact-submit-wrapper").style.display = "block"
						chrome.storage.sync.set({"rephrase": ""})
					}
				})
				.catch(function(error) {
					alert(error.message);
				})				});			
	})
}

setPopupAction = (actionType) => {
	actionType = actionType
	switch (actionType) {
		case "fact":
			console.log("collecting fact")
			$("#form-header").text("collect fact")
			$("#submit-fact-button").val("submit for review")
			return

		case "comment":
			console.log("posting comment")
			$("#form-header").text("post comment")			
			$("#submit-fact-button").val("post comment")
			return

		default: 
			return
	}
}

searchFacts = (searhPhrase, token) => {
	$("#database-facts-wrapper").empty()

  let searchVal = document.getElementById("fact-search-input").value

  let configObj = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    }, 
    body: JSON.stringify({
      searchVal: searchVal,
    })
  }
  // debugger
  fetch(API_ROOT + `/fact-search`, configObj)
    .then(resp => resp.json())
    .then((facts) => {
			renderFacts(facts)
   })
   .catch(err => alert(err.message))	
}

renderFacts = (facts) => {
	facts.map(fact => {
		// const factContainer = document.createElement("div");
		const factContainer = $("<div>", {"class": "fact-container"});
		factContainer.text(fact.content)
		$("#database-facts-wrapper").append(factContainer)		
	})
}

document.getElementById("rephrase-input").addEventListener("keyup", (e) => {
	console.log("updating rephrase in storage")
	chrome.storage.sync.set({
		"rephrase": e.target.value,
		"lastSelection": document.getElementById("selection-wrapper").innerText
	})
})	

document.getElementById("logout-button").addEventListener("click", () => {
	chrome.storage.sync.set({"token": ""})
	window.close()
})

document.getElementById("collect-fact-option").addEventListener("click", () => {
	setPopupAction("fact")
})

document.getElementById("post-comment-option").addEventListener("click", () => {
	setPopupAction("comment")
})

document.getElementById("search-facts-button").addEventListener("click", (e) => {
	e.preventDefault()
	let token = chrome.storage.sync.get("token", (result) => {
		searchFacts(e.target.value, result.token)
	})
})