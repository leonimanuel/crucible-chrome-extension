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

	fetch("http://localhost:3000" + "/users/user", configObj)
	.then(resp => resp.json())
	.then(data => {
		if (data.email) {
			console.log(data)
			showUser(data.email)
			// localStorage.setItem("token", data.auth_token)
			// this.props.logIn(data)
		} else {
			console.log("LOGIN UNSUCCESSSFUL")
		}
	})
	.catch(err => alert(err.message))	
})