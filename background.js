chrome.browserAction.setBadgeBackgroundColor({color: "#318fb5"})

chrome.storage.onChanged.addListener(function(changes, storageName) {
	console.log("Changes:", changes)
	if (changes.token) {
		if (changes.token.newValue === "") {
			console.log("closing socket")
			socket.close();
			rDSocket.close();
			chrome.storage.sync.set({ id: "", name: "", unreads: "" }, () => {
				chrome.browserAction.setBadgeText({"text": "err"});
				chrome.browserAction.setBadgeBackgroundColor({color: "red"});					
			})			
		}
		else {
			createMessageNotificationsWebsocketConnection();
			setTimeout(() => {
				chrome.storage.sync.get("id", (result) => {
					createReadDiscussionWebsocketConnection(result.id)
				})
			}, 200)
		}				
	} 
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('onStartup....');
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
		fetch("http://localhost:3000" + "/users/extension", configObj)
		.then(resp => resp.json())
		.then(user => {
		  if (user.name) {
				createMessageNotificationsWebsocketConnection();
				setTimeout(() => createReadDiscussionWebsocketConnection(user.id), 2000) 
			  chrome.storage.sync.set({
			  	"id": user.id,
			  	"name": user.name,
			  	"unreads": user.unread_messages_count
			  }, () => {
					if (user.unread_messages_count !== 0) {
						chrome.browserAction.setBadgeText({
							"text": user.unread_messages_count.toString()
						});		
					}	  	
			  });		  	
		  } 
		  else {
				debugger
				chrome.storage.sync.set({ name: "", unreads: "" }, () => {
					chrome.browserAction.setBadgeText({"text": "err"});
					chrome.browserAction.setBadgeBackgroundColor({color: "red"});					
				})
		  }  					
		})
		.catch(err => {
			debugger
			chrome.browserAction.setBadgeText({"text": "err"});			
		})	
	})  
});

// test_messaging_app_front_end/index.js
// Opens a WebSocket connection to a specific Chat Room stream.
function createMessageNotificationsWebsocketConnection() {
    
    // Creates the new WebSocket connection.
    socket = new WebSocket('wss://crucible-api.herokuapp.com/cable');
     
     // When the connection is first created, this code runs subscribing the client to a specific chatroom stream in the ChatRoomChannel.
    socket.onopen = function(event) {
        console.log('WebSocket is connected.');
        const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
                channel: 'MessageNotificationsChannel'
            }),
        };
        socket.send(JSON.stringify(msg));
    };
    
    // When the connection is closed, this code will run.
    socket.onclose = function(event) {
         console.log('WebSocket is closed.');
    };

    // When a message is received through the websocket, this code will run.
    socket.onmessage = function(event) {            
        const response = event.data;
        const msg = JSON.parse(response);
        
        // Increment the value of unread messages count in storage and reflect that value in the badge
        chrome.storage.sync.get("unreads", (result) => {
          if (msg.message && msg.message.unread_messages === 1) {
            chrome.storage.sync.set({"unreads": result.unreads + 1}, () => {
              chrome.browserAction.setBadgeText({"text": (result.unreads + 1).toString()})
              chrome.browserAction.setBadgeBackgroundColor({color: "blue"}, () => {
              	setTimeout(() => {
              		chrome.browserAction.setBadgeBackgroundColor({color: "red"}, () => {
										setTimeout(() => {
											chrome.browserAction.setBadgeBackgroundColor({color: "blue"}, () => {
												setTimeout(() => {
													chrome.browserAction.setBadgeBackgroundColor({color: "red"})
												}, 200)
											})
										}, 200)
              		});	
              	}, 200)
              });	
            })
          }
        })         
        // Ignores pings.
        if (msg.type === "ping") {
            return;
        }
        
        console.log("FROM RAILS: ", msg);       
    };
    
    // When an error occurs through the websocket connection, this code is run printing the error message.
    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };
}






function createReadDiscussionWebsocketConnection(userId) {
    
    // Creates the new WebSocket connection.
    rDSocket = new WebSocket('wss://crucible-api.herokuapp.com/cable');
     
     // When the connection is first created, this code runs subscribing the client to a specific chatroom stream in the ChatRoomChannel.
    rDSocket.onopen = function(event) {
        console.log('RD WebSocket is connected.');
        const msg = {
            command: 'subscribe',
            identifier: JSON.stringify({
                user: userId,
                channel: 'ReadDiscussionChannel'
            }),
        };
        rDSocket.send(JSON.stringify(msg));
    };
    
    // When the connection is closed, this code will run.
    rDSocket.onclose = function(event) {
         console.log('RD WebSocket is closed.');
    };

    // When a message is received through the websocket, this code will run.
    rDSocket.onmessage = function(event) {            
        const response = event.data;
        const msg = JSON.parse(response);
      
        // Ignores pings.
        if (msg.type === "ping") {
            return;
        }
				else if (msg.message) {
					// console.log(msg.message)
					chrome.storage.sync.set({"unreads": msg.message.total_unreads}, () => {
						if (msg.message.total_unreads === 0) {
							chrome.browserAction.setBadgeText({"text": ""})
						} else {
							chrome.browserAction.setBadgeText({"text": msg.message.total_unreads.toString()})
						}
					})
				}
				//get and store the updated total unread count

      //   chrome.storage.sync.get("unreads", (result) => {
      //     if (msg.message && msg.message.total_unreads) {
						// chrome.storage.sync.set({"unreads": msg.message.total_unreads})
      //     }
      //   })   
        
        console.log("FROM RAILS: ", msg);       
    };
    
    // When an error occurs through the websocket connection, this code is run printing the error message.
    rDSocket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };
}

