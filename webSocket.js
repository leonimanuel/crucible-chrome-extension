// test_messaging_app_front_end/index.js
// Opens a WebSocket connection to a specific Chat Room stream.
function createChatRoomWebsocketConnection() {
    
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
        chrome.storage.sync.get("unread_messages_count", (result) => {
            if (msg.message && msg.message.unread_messages === 1) {
                chrome.storage.sync.set({"unread_messages_count": result.unread_messages_count + 1}, () => {
                    chrome.browserAction.setBadgeText({"text": (result.unread_messages_count + 1).toString()});
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




