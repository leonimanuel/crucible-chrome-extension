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

	fetch("https://crucible-api.herokuapp.com" + "/authenticate", configObj)
		.then(resp => resp.json())
		.then(data => {
			if (data.auth_token) {
				chrome.storage.sync.set({"token": data.auth_token})
				$("#login-form").css("display", "none")
				isSignedIn = true
				showUser(data.user.name)
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
	chrome.storage.sync.get("rephrase", (result) => {
		$("#rephrase-input").val(result.rephrase ? result.rephrase : "")
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
	let token = chrome.storage.local.get("token", (result) => {
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
		fetch("https://crucible-api.herokuapp.com/add-from-extension", configObj)
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
			})				
	})
}

document.getElementById("rephrase-input").addEventListener("keyup", (e) => {
	console.log("updating rephrase in storage")
	chrome.storage.sync.set({"rephrase": e.target.value})
})	
// window.onblur = function(){
// 	chrome.storage.sync.set({"rephrase": document.getElementById("rephrase-input").value})
// }
