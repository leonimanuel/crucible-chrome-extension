chrome.runtime.onMessage.addListener(
  function(message, callback) {
    if (message === "changeColor") {
      debugger
      chrome.tabs.executeScript({
        code: 'document.body.style.backgroundColor="orange"'
      });
    }
  }
);