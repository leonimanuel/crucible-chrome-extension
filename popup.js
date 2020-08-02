let loginForm = document.getElementById("login-form");
console.log(loginForm)

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
	fetch("https://crucible-api.herokuapp.com" + "/authenticate", configObj)
	.then(resp => resp.json())
	.then(data => {
		if (data.auth_token) {
			chrome.storage.sync.set({"token": data.auth_token})
			console.log(data)
			$("#login-form").empty()
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
	$("#login-form").css("display", "none")
	$("#user-name").text(name)
}

showSelection = () => {
	chrome.tabs.executeScript({
	    code: "window.getSelection().toString();"
	}, function(selection) {
	    if (selection[0]) {
	    	document.getElementById("selection-wrapper").innerHTML = selection[0]
	    	document.getElementById("selection-view").style.display = "block"
	    } else {
	    	$("#no-selection-view").css("display", "block")
	    }
	    // let selectionWrapper = document.createElement("div")
	    // selectionWrapper.id = "selection-wrapper"
	    // selectionWrapper.innerHTML = selection[0]
	    
	    // let main = document.getElementById("main")
	    // main.appendChild(selectionWrapper)
	});
	// console.log("logging selection: ", window.getSelection())
	// if (window.getSelection()) {
	// 	const selection = document.createElement("div")
	// 	selection.id = "selection-text"
	// 	selection.innerText = window.getSelection()
	// 	$("#main").append(selection)
	// }
}

showSelection()


// chrome.tabs.executeScript({
//     code: "window.getSelection().toString();"
// }, function(selection) {
//     document.getElementById("output").innerHTML = selection[0];
// });













