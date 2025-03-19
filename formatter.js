document.getElementById('format').addEventListener('click', function() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        output.textContent = formatted;
        
        // 添加语法高亮
        output.innerHTML = output.innerHTML
            .replace(/"([^"]+)":/g, '<span style="color: #9cdcfe">"$1"</span>:')
            .replace(/"([^"]+)"/g, '<span style="color: #ce9178">"$1"</span>')
            .replace(/\b(true|false)\b/g, '<span style="color: #569cd6">$1</span>')
            .replace(/\b(\d+)\b/g, '<span style="color: #b5cea8">$1</span>')
            .replace(/\bnull\b/g, '<span style="color: #569cd6">null</span>');
    } catch (e) {
        output.textContent = '错误：' + e.message;
        output.style.color = '#f44336';
    }
});

// 添加快捷键支持
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('format').click();
    }
});