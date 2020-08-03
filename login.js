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
	fetch("https://crucible-api.herokuapp.com" + "/users/extension", configObj)
	.then(resp => resp.json())
	.then(data => {
		if (data.name) {
			isSignedIn = true
			showUser(data.name)
		} else {
			document.getElementById("login-form").style.display = "block"
		}
	})
	.catch(err => {
		alert(err.message)
		document.getElementById("login-form").style.display = "block"
	})	
})

// chrome.storage.sync.get("rephrase", (result) => {
// 	alert("sup dawg")
// }  

document.getElementById("logout-button").addEventListener("click", () => {
	chrome.storage.sync.set({"token": ""})
	window.close()
})