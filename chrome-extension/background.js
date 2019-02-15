console.log('background running')
chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
  chrome.tabs.executeScript(null,{file:"content.js"});
}, { url: [{urlMatches : 'https://www.youtube.com/watch*'}]});
