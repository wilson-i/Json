chrome.action.onClicked.addListener(function(tab) {
    const formatterURL = chrome.runtime.getURL('formatter.html');
    chrome.tabs.create({
        url: formatterURL
    });
});

// 监听快捷键
chrome.commands.onCommand.addListener((command) => {
    if (command === "open-formatter") {
        chrome.windows.create({
            url: 'formatter.html',
            type: 'popup',
            width: 1200,
            height: 800,
            left: (screen.width - 1200) / 2,
            top: (screen.height - 800) / 2
        });
    }
});

// 保持服务工作进程活跃
chrome.runtime.onInstalled.addListener(() => {
    console.log('W-JSON Formatter 已安装');
});