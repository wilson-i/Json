chrome.action.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL('formatter.html'),
    type: 'popup',
    width: 1200,
    height: 800,
    state: 'normal'
  });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('W-JSON 插件已安装');
});