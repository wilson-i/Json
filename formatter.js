document.addEventListener('DOMContentLoaded', function() {
    const formatButton = document.getElementById('format');
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    
    if (!formatButton || !inputArea || !outputArea) {
        console.error('Required elements not found');
        return;
    }
    
    // 添加复制按钮
    const copyButton = document.createElement('button');
    copyButton.textContent = '复制';
    copyButton.style.marginLeft = '10px';
    formatButton.parentNode.insertBefore(copyButton, formatButton.nextSibling);
    
    // 格式化功能
    function formatJSON(input) {
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            outputArea.textContent = formatted;
            
            // 添加语法高亮
            outputArea.innerHTML = outputArea.innerHTML
                .replace(/"([^"]+)":/g, '<span style="color: #9cdcfe">"$1"</span>:')
                .replace(/"([^"]+)"/g, '<span style="color: #ce9178">"$1"</span>')
                .replace(/\b(true|false)\b/g, '<span style="color: #569cd6">$1</span>')
                .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8">$1</span>')
                .replace(/\bnull\b/g, '<span style="color: #569cd6">null</span>');
            
            copyButton.style.display = 'inline-block';
            outputArea.style.color = '#d4d4d4';
            return true;
        } catch (e) {
            outputArea.textContent = '错误：' + e.message;
            outputArea.style.color = '#f44336';
            copyButton.style.display = 'none';
            return false;
        }
    }
    
    // 复制功能
    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(outputArea.textContent).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = '已复制！';
            setTimeout(() => {
                copyButton.textContent = originalText;
            }, 1500);
        });
    });
    
    // 格式化按钮点击事件
    formatButton.addEventListener('click', function() {
        formatJSON(inputArea.value);
    });
    
    // 自动格式化
    inputArea.addEventListener('input', function() {
        if (this.value.trim()) {
            formatJSON(this.value);
        } else {
            outputArea.textContent = '';
            copyButton.style.display = 'none';
        }
    });
    
    // 快捷键支持
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            formatButton.click();
        }
    });
});