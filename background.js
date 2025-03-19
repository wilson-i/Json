chrome.action.onClicked.addListener(function(tab) {
  chrome.windows.create({
    url: chrome.runtime.getURL('formatter.html'),
    type: 'popup',
    width: 1200,
    height: 800,
    left: (screen.width - 1200) / 2,
    top: (screen.height - 800) / 2
  });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('W-JSON 插件已安装');
});