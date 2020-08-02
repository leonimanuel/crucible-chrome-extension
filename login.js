console.log("loginBoi")

chrome.storage.sync.get("token", (result) => {
	let configObj = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: result.token
		}
	}
	// debugger
	// fetch("https://crucible-api.herokuapp.com" + "/users/extension", configObj)
	fetch("http://localhost:3000" + "/users/extension", configObj)	
	.then(resp => resp.json())
	.then(data => {
		console.log("DATA", data)
		if (data.name) {
			isSignedIn = true
			showUser(data.name)
			// localStorage.setItem("token", data.auth_token)
			// this.props.logIn(data)
		} else {
			document.getElementById("login-form").style.display = "block"
			console.log("LOGIN UNSUCCESSSFUL")
		}
	})
	.catch(err => {
		alert(err.message)
		document.getElementById("login-form").style.display = "block"
	})	
})