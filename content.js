function isJsonString(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

function formatJSON() {
    const pre = document.querySelector('pre');
    if (!pre) return;
    
    const text = pre.textContent;
    if (!isJsonString(text)) return;
    
    const json = JSON.parse(text);
    const formatted = JSON.stringify(json, null, 2);
    
    pre.innerHTML = '';
    pre.appendChild(document.createTextNode(formatted));
    
    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制';
    copyButton.className = 'json-formatter-copy';
    copyButton.onclick = () => {
        navigator.clipboard.writeText(formatted);
        copyButton.textContent = '已复制!';
        setTimeout(() => {
            copyButton.textContent = '复制';
        }, 2000);
    };
    
    // 在pre元素旁边添加按钮，而不是直接添加到body
    pre.parentNode.insertBefore(copyButton, pre.nextSibling);
}

// 页面加载完成后执行格式化
document.addEventListener('DOMContentLoaded', formatJSON);
