// 点击扩展图标时打开格式化器页面
chrome.action.onClicked.addListener((tab) => {
  chrome.windows.create({
    url: chrome.runtime.getURL('formatter.html'),
    type: 'popup',
    width: 1200,
    height: 800,
    state: 'normal'
  });
});

// 扩展安装时执行
chrome.runtime.onInstalled.addListener(() => {
  console.log('W-JSON 插件已安装');
});