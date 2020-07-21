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
			email: "billy@aol.com",
			password: "greenbeans"
		})
	}

	fetch("http://localhost:3000" + "/authenticate", configObj)
	.then(resp => resp.json())
	.then(data => {
		if (data.auth_token) {
			chrome.storage.sync.set({"token": data.auth_token})
			console.log(data)
			$("#main").empty()
			showUser(data.email)
			// localStorage.setItem("token", data.auth_token)
			// this.props.logIn(data)
		} else {
			console.log("LOGIN UNSUCCESSSFUL")
		}
	})
	.catch(err => alert(err.message))
})

showUser = (email) => {
	$("#main").empty()
	let userDisplay = document.createElement("div");
	userDisplay.id = "user-display";
	userDisplay.innerText = `User: ${email}`
	$("#main").append(userDisplay)
}
