let isSignedIn = false

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

	// debugger
	// fetch("https://crucible-api.herokuapp.com" + "/authenticate", configObj)
	fetch("http://localhost:3000" + "/authenticate", configObj)	
	.then(resp => resp.json())
	.then(data => {
		if (data.auth_token) {
			chrome.storage.sync.set({"token": data.auth_token})
			console.log(data)
			$("#login-form").css("display", "none")
			showUser(data.name)
			// localStorage.setItem("token", data.auth_token)
			// this.props.logIn(data)
		} else {
			console.log("LOGIN UNSUCCESSSFUL")
		}
	})
	.catch(err => alert(err.message))
})

showUser = (name) => {
	// $("#login-form").css("display", "none")
	$("#user-name").text(name)
	chrome.tabs.executeScript({
	    code: "window.getSelection().toString();"
	}, function(selection) {
	    if (isSignedIn) {
		    if (selection[0]) {
		    	document.getElementById("selection-wrapper").innerHTML = selection[0]
		    	document.getElementById("selection-view").style.display = "block"
		    } else {
		    	$("#no-selection-view").css("display", "block")
		    }
	    }
	});
}

const submitFactForm = document.getElementById("submit-fact-form")
submitFactForm.addEventListener("submit", (e) => {
	e.preventDefault();
	getTab(postFact);
})

getTab = (callback) => {
	chrome.tabs.query({active:true, currentWindow:true},function(tabs){
	  console.log("getting tab")
	  callback(tabs[0].url);
	});	
}

postFact = (tab) => {
	debugger
	let token = chrome.storage.sync.get("token", (result) => {
		let configObj = {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: result.token
			},
			body: JSON.stringify({
					"selected_text": document.getElementById("selection-wrapper").innerText,
					"rephrase": document.getElementById("rephrase-input").value,
					"selection_url": tab			
			})
		}
		// fetch("https://crucible-api.herokuapp.com/facts", configObj)
		fetch("http://localhost:3000" + "/add-from-extension", configObj)
			.then(resp => resp.json())
			.then(function(object) {
				if (object.status === "success") {
					$("#main").empty()
					document.getElementById("successful-fact-submit-wrapper").style.display = "block"
				}
			})
			.catch(function(error) {
				alert(error.message);
			})				
	})
}

